using Microsoft.AspNetCore.Identity;

namespace Food4Groups.Api.Extensions;

// Klasa odpowiedzialna za inicjalizację ról oraz kont testowych podczas uruchamiania aplikacji
public static class IdentitySeeder
{
    private static readonly string[] Roles =
    [
        "Admin",
        "CateringEmployee",
        "Dietitian",
        "GroupCoordinator",
        "User"
    ];
    
    // Pole przechowujace tablice krotek (Email, Password, Role) kont testowych
    private static readonly (string Email, string Password, string Role)[] Users =
    {
        ("admin@food4groups.com", "Admin123!", "Admin"),
        ("catering@food4groups.com", "Test123!", "CateringEmployee"),
        ("dietitian@food4groups.com", "Test123!", "Dietitian"),
        ("coordinator@food4groups.com", "Test123!", "GroupCoordinator"),
        ("user@food4groups.com", "Test123!", "User")
    };
    
    // Inicializuje role oraz konto admina, IServiceProvider - interfejs odpowiedzialny za pobieranie instancji  
    public static async Task SeedIdentityAsync(this IServiceProvider services)
    {
        // Tworzy zakres usłuh - scope aby pobrać zależności z DI, 'using' - po zakończeniu pracy scope zostanie zamknięty, a obiekty usuniete z pamieci 
        using var scope = services.CreateScope();
        
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        
        // Utworzenie wymaganych ról systemowych
        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
        
        // Utworzenie kont testowych przypisanych do poszczególnych ról
        foreach (var user in Users)
        {
            await SeedUserAsync(userManager, user.Email, user.Password, user.Role);
        }
    }

    private static async Task SeedUserAsync(
        UserManager<IdentityUser> userManager,
        string email,
        string password,
        string role)
    {
        var user = await userManager.FindByNameAsync(email);
        if (user == null)
        {
            user = new IdentityUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
            };
            
            // Identity hashuje haslo i tworzy uzytkownika
            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                return;
            }
        }
        
        // Zapobiega wielokrotnemu przypisaniu tej samej roli użytkownikowi
        if (!await userManager.IsInRoleAsync(user, role))
        {
            await userManager.AddToRoleAsync(user, role);
        }
        
    }
}