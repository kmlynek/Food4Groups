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

    [HttpPut("{userId}/role")]
    public async Task<IActionResult> SetRole(string userId, [FromBody] SetUserRoleRequest request)
    {
        try
        {
            // Jedna operacja zastępuje dotychczasowe role użytkownika wybraną rolą
            await _adminUserService.SetRoleAsync(userId, request);
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
