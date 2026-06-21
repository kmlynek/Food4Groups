using Food4Groups.Application.DTOs.Admin;

namespace Food4Groups.Application.Interfaces.Admin;

public interface IAdminUserService
{
    Task<List<AdminUserResponse>> GetUsersAsync();
    Task AssignRoleAsync(string userId, AssignUserRoleRequest request);
    Task RemoveRoleAsync(string userId, string roleName);
    Task DeleteUserAsync(string userId, string? currentUserId);
}