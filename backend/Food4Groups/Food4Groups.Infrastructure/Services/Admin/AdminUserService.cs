using Food4Groups.Application.DTOs.Admin;
using Food4Groups.Application.Interfaces.Admin;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.Admin;

public class AdminUserService : IAdminUserService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AdminUserService(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<List<AdminUserResponse>> GetUsersAsync()
    {
        // Użytkownicy są pobierani z Identity, a role są dołączane do DTO zwracanego przez API
        var users = await _userManager.Users
            .AsNoTracking()
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

        return result;
    }

    public async Task AssignRoleAsync(string userId, AssignUserRoleRequest request)
    {
        // Przypisanie roli wymaga istnienia zarówno użytkownika, jak i roli w systemie
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required");

        if (string.IsNullOrWhiteSpace(request.RoleName))
            throw new ArgumentException("Role name is required");

        var roleName = request.RoleName.Trim();

        if (!await _roleManager.RoleExistsAsync(roleName))
            throw new KeyNotFoundException($"Role '{roleName}' does not exist");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            throw new KeyNotFoundException("User not found");

        // Zapobiega ponownemu przypisaniu tej samej roli użytkownikowi
        if (await _userManager.IsInRoleAsync(user, roleName))
            throw new InvalidOperationException($"User already has role '{roleName}'");

        var addResult = await _userManager.AddToRoleAsync(user, roleName);
        if (!addResult.Succeeded)
            throw new ArgumentException(FormatIdentityErrors(addResult));
    }

    public async Task RemoveRoleAsync(string userId, string roleName)
    {
        // Usunięcie roli jest możliwe tylko wtedy, gdy użytkownik faktycznie ją posiada
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required");

        if (string.IsNullOrWhiteSpace(roleName))
            throw new ArgumentException("Role name is required");

        var roleToRemove = roleName.Trim();

        if (!await _roleManager.RoleExistsAsync(roleToRemove))
            throw new KeyNotFoundException($"Role '{roleToRemove}' does not exist");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            throw new KeyNotFoundException("User not found");

        if (!await _userManager.IsInRoleAsync(user, roleToRemove))
            throw new InvalidOperationException($"User does not have role '{roleToRemove}'");

        var removeResult = await _userManager.RemoveFromRoleAsync(user, roleToRemove);
        if (!removeResult.Succeeded)
            throw new ArgumentException(FormatIdentityErrors(removeResult));
    }

    public async Task DeleteUserAsync(string userId, string? currentUserId)
    {
        // Administrator nie powinien mieć możliwości usunięcia własnego konta
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required");

        if (currentUserId == userId)
            throw new InvalidOperationException("You cannot delete your own account");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            throw new KeyNotFoundException("User not found");

        if (await _userManager.IsInRoleAsync(user, "Admin"))
        {
            // Blokada chroni system przed sytuacją, w której nie zostanie żaden administrator
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            if (admins.Count <= 1)
                throw new InvalidOperationException("Cannot delete the last admin user");
        }

        try
        {
            var deleteResult = await _userManager.DeleteAsync(user);
            if (!deleteResult.Succeeded)
                throw new ArgumentException(FormatIdentityErrors(deleteResult));
        }
        catch (DbUpdateException)
        {
            // Konflikt oznacza, że użytkownik jest powiązany z innymi danymi domenowymi
            throw new InvalidOperationException("User cannot be deleted because it is connected with other data");
        }
    }
    
    // Kolekcja błędów, errors są wyświetlane kolejno po sobie
    private static string FormatIdentityErrors(IdentityResult result)
    {
        return string.Join("; ", result.Errors.Select(x => x.Description));
    }
}
