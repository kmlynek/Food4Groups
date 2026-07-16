using Food4Groups.Application.DTOs.Admin;
using Food4Groups.Application.Interfaces.Admin;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.Admin;

public class AdminUserService : IAdminUserService
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ApplicationDbContext _dbContext;

    public AdminUserService(
        UserManager<IdentityUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ApplicationDbContext dbContext)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _dbContext = dbContext;
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

    public async Task SetRoleAsync(string userId, SetUserRoleRequest request)
    {
        // Zmiana roli wymaga istnienia zarówno użytkownika, jak i wybranej roli w systemie
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("Wybierz użytkownika");

        if (string.IsNullOrWhiteSpace(request.RoleName))
            throw new ArgumentException("Wybierz rolę");

        var roleName = request.RoleName.Trim();

        if (!await _roleManager.RoleExistsAsync(roleName))
            throw new KeyNotFoundException($"Rola „{roleName}” nie istnieje");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            throw new KeyNotFoundException("Nie znaleziono użytkownika");

        var currentRoles = await _userManager.GetRolesAsync(user);

        // Ponowny zapis tej samej, pojedynczej roli nie wymaga zmian w bazie
        if (currentRoles.Count == 1 &&
            string.Equals(currentRoles[0], roleName, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        // Transakcja zapobiega pozostawieniu konta bez roli, gdy przypisanie nowej roli się nie powiedzie
        await using var transaction = await _dbContext.Database.BeginTransactionAsync();

        if (currentRoles.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
                throw new ArgumentException(FormatIdentityErrors(removeResult));
        }

        var addResult = await _userManager.AddToRoleAsync(user, roleName);
        if (!addResult.Succeeded)
            throw new ArgumentException(FormatIdentityErrors(addResult));

        await transaction.CommitAsync();
    }

    public async Task DeleteUserAsync(string userId, string? currentUserId)
    {
        // Administrator nie powinien mieć możliwości usunięcia własnego konta
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("Wybierz użytkownika");

        if (currentUserId == userId)
            throw new InvalidOperationException("Nie możesz usunąć własnego konta");

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            throw new KeyNotFoundException("Nie znaleziono użytkownika");

        if (await _userManager.IsInRoleAsync(user, "Admin"))
        {
            // Blokada chroni system przed sytuacją, w której nie zostanie żaden administrator
            var admins = await _userManager.GetUsersInRoleAsync("Admin");
            if (admins.Count <= 1)
                throw new InvalidOperationException("Nie można usunąć ostatniego administratora");
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
            throw new InvalidOperationException("Nie można usunąć użytkownika powiązanego z innymi danymi");
        }
    }
    
    private static string FormatIdentityErrors(IdentityResult _)
    {
        return "Nie udało się zmienić roli użytkownika";
    }
}
