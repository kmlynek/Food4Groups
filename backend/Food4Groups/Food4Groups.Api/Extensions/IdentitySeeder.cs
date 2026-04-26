using Microsoft.AspNetCore.Identity;

namespace Food4Groups.Api.Extensions;

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
    
    public static async Task SeedIdentityAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        
        //Seed ról
        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
        
        //2 Seed konta admina
        const string adminEmail = "admin@food4groups.pl";
        const string adminPassword = "admin123";
        
        var admin  = await userManager.FindByNameAsync("adminEmail");
        if (admin == null)
        {
            admin = new IdentityUser
            {
                UserName = "adminEmail",
                Email = adminEmail,
                EmailConfirmed = true,
            };
            
            var createResult = await userManager.CreateAsync(admin, adminPassword);
            if (createResult.Succeeded)
            {
                await userManager.AddToRoleAsync(admin, "Administrator");
            }
        }
        
    }
}