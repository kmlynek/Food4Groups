using Food4Groups.Application.DTOs.Admin;

namespace Food4Groups.Application.Interfaces.Admin;

public interface IAdminUserService
{
    Task<List<AdminUserResponse>> GetUsersAsync();
    Task SetRoleAsync(string userId, SetUserRoleRequest request);
    Task DeleteUserAsync(string userId, string? currentUserId);
}