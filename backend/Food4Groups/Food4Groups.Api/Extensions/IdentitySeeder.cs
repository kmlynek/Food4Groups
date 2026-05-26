using Microsoft.AspNetCore.Identity;

namespace Food4Groups.Api.Extensions;

// Inicjalne wypełnienie danych IDentity wywoływane przy starcie aplikacji
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
    
    // Tworzy role oraz konto admina, IServiceProvider - interfejs odpowiedzialny za pobieranie instancji  
    public static async Task SeedIdentityAsync(this IServiceProvider services)
    {
        // Tworzy scope aby pobrać zależności z DI  (w nim DI jest dostępne), 'using' - po zakończeniu pracy cała szuflada (scope) zostanie zamknięta, a obiekty usuniete z pamieci 
        using var scope = services.CreateScope();
        
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        
        // Seed ról
        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
        
        // Seed konta admina
        const string adminEmail = "admin@food4groups.com";
        const string adminPassword = "Admin123!";
        
        var admin  = await userManager.FindByNameAsync(adminEmail);
        if (admin == null)
        {
            // Tworzy konto admina
            admin = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true,
            };
            
            var createResult = await userManager.CreateAsync(admin, adminPassword);
            // Jesli utworzenie sie powiodlo, przypisuje rolę Admin
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
        
    }
}