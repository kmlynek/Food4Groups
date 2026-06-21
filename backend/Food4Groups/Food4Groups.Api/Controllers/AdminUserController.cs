using System.Security.Claims;
using Food4Groups.Application.DTOs.Admin;
using Food4Groups.Application.Interfaces.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminUserController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminUserController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminUserResponse>>> GetUsers()
    {
        var users = await _adminUserService.GetUsersAsync();
        return Ok(users);
    }

    [HttpPost("{userId}/roles")]
    public async Task<IActionResult> AssignRole(string userId, [FromBody] AssignUserRoleRequest request)
    {
        try
        {
            // Kontroler deleguje zarządzanie rolami do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            await _adminUserService.AssignRoleAsync(userId, request);
            return NoContent();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }

    [HttpDelete("{userId}/roles/{roleName}")]
    public async Task<IActionResult> RemoveRole(string userId, string roleName)
    {
        try
        {
            await _adminUserService.RemoveRoleAsync(userId, roleName);
            return NoContent();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }

    [HttpDelete("{userId}")]
    public async Task<IActionResult> DeleteUser(string userId)
    {
        try
        {
            // Identyfikator aktualnie zalogowanego użytkownika jest pobierany z tokenu JWT
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _adminUserService.DeleteUserAsync(userId, currentUserId);
            return NoContent();
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }
}
