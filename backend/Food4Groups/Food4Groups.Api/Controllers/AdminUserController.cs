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
        var users = await _userManager.Users
            .OrderBy(x => x.UserName)
            .ToListAsync();


        var result = new List<AdminUserResponse>(users.Count);

        foreach (var user in users)
        {
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
        if (string.IsNullOrWhiteSpace(request.RoleName))
            return BadRequest("Role name is required");
        
        var roleName = request.RoleName.Trim();

        if (!await _roleManager.RoleExistsAsync(roleName))
            return NotFound($"Role '{roleName}' does not exist");
        
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound("User not found");

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
        
        if (!await _roleManager.RoleExistsAsync(roleRemove))
            return NotFound($"Role '{roleRemove}' does not exist");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound("User not found");

        if (!await _userManager.IsInRoleAsync(user, roleRemove))
            return Conflict($"User does not have role '{roleRemove}'");

        var removeResult = await _userManager.RemoveFromRoleAsync(user, roleRemove);
        if (!removeResult.Succeeded)
            return BadRequest(removeResult.Errors);

        return NoContent();
        
    }
    
}