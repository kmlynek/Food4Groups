using System.Security.Claims;
using Food4Groups.Application.DTOs.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]") ]
[Authorize(Roles = "Admin")]
public class AdminUserController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AdminUserController(
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminUserResponse>>> GetUsers()
    {
        // Pobranie listy użytkowników wraz z uporządkowaniem alfabetyczny, dane są następnie rozszerzane o przypisane role
        var users = await _userManager.Users
            .OrderBy(x => x.UserName)
            .ToListAsync();


        var result = new List<AdminUserResponse>(users.Count);

        foreach (var user in users)
        {
            // Role są pobierane osobno, ponieważ Identity przechowuje informacje w oddzielnych tabelach relacyjnych
            var roles = await _userManager.GetRolesAsync(user);

            result.Add(new AdminUserResponse
            {
                Id = user.Id,
                Email = user.Email,
                Roles = roles.ToList()
            });
        }
        
        return Ok(result);
    }

    [HttpPost("{userId}/roles")]
    public async Task<IActionResult> AssignRole(string userId, [FromBody] AssignUserRoleRequest request)
    {
        // Walidacja nazwy roli zabezpiecza przed przekazaniem pustej wartości
        if (string.IsNullOrWhiteSpace(request.RoleName))
            return BadRequest("Role name is required");
        
        var roleName = request.RoleName.Trim();

        // Przed przypisaniem roli sprawdzane jest, czy taka rola istnieje w systemie
        if (!await _roleManager.RoleExistsAsync(roleName))
            return NotFound($"Role '{roleName}' does not exist");
        
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound("User not found");

        // Zapobiega ponownemu przypisaniu tej samej roli użytkownikowi
        if (await _userManager.IsInRoleAsync(user, roleName))
            return Conflict($"User already has role '{roleName}'");

        var addResult = await _userManager.AddToRoleAsync(user, roleName);
        if (!addResult.Succeeded)
            return BadRequest(addResult.Errors);

        return NoContent();
    }
    
    [HttpDelete("{userId}/roles/{roleName}")]
    public async Task<IActionResult> RemoveRole(string userId, string roleName)
    {
        if (string.IsNullOrWhiteSpace(roleName))
            return BadRequest("Role name is required");
        
        var roleRemove = roleName.Trim();
        
        // Usuwanie roli jest możliwe tylko wtedy, gdy wskazana rola istnieje
        if (!await _roleManager.RoleExistsAsync(roleRemove))
            return NotFound($"Role '{roleRemove}' does not exist");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound("User not found");

        // Sprawdzenie zapobiega próbie usunięcia roli, której użytkownik nie posiada
        if (!await _userManager.IsInRoleAsync(user, roleRemove))
            return Conflict($"User does not have role '{roleRemove}'");

        var removeResult = await _userManager.RemoveFromRoleAsync(user, roleRemove);
        if (!removeResult.Succeeded)
            return BadRequest(removeResult.Errors);

        return NoContent();
        
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        // Identyfikator aktualnie zalogowanego użytkownika jest pobierany z tokenu JWT, Admin nie może usunąć własnego konta 
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == userId)
            return Conflict("You cannot delete your own account");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound("User not found");
        
        // Jeśli usuwany użytkownik jest adminem, system sprawdza czy nie jest to ostatnie konto admina
        if (await _userManager.IsInRoleAsync(user, "Admin"))
        {
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            if (admins.Count <= 1)
                return Conflict("Cannot delete the last admin user");
        }

        try
        {
            var deleteResult = await _userManager.DeleteAsync(user);
            if (!deleteResult.Succeeded)
                return BadRequest(deleteResult.Errors);
        }
        catch (DbUpdateException)
        {
            // Konflikt oznacza, że użytkownik jest powiązany z innymi danymi, np. zamówieniami, grupa, czy historia operacji
            return Conflict("User cannot be deleted because it is connected with other data");
        }

        return NoContent();
    }
}