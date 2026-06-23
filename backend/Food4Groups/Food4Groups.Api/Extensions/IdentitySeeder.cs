using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

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
    
    // Statusy wykorzystywane w procesie obsługi zamówienia
    private static readonly (string Name, bool IsFinal)[] OrderStatuses =
    {
        ("Created", false),
        ("Accepted", false),
        ("Prepared", false),
        ("Completed", true),
        ("Cancelled", true)
    };
    
    private const string GroupSettlementProformaTemplateCode = "GroupSettlementProforma";
    
    // Inicializuje role oraz konto admina, IServiceProvider - interfejs odpowiedzialny za pobieranie instancji  
    public static async Task SeedIdentityAsync(this IServiceProvider services)
    {
        // Tworzy zakres usłuh - scope aby pobrać zależności z DI, 'using' - po zakończeniu pracy scope zostanie zamknięty, a obiekty usuniete z pamieci 
        using var scope = services.CreateScope();
        
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
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
        
        await SeedOrderStatusesAsync(dbContext);
        
        await SeedPrintTemplatesAsync(dbContext);
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

    private static async Task SeedOrderStatusesAsync(ApplicationDbContext dbContext)
    {
        foreach (var status in OrderStatuses)
        {
            var exists = await dbContext.OrderStatuses.AnyAsync(x => x.Name == status.Name);
            if (exists)
            {
                continue;
            }

            dbContext.OrderStatuses.Add(new OrderStatus
            {
                Id = Guid.NewGuid(),
                Name = status.Name,
                IsFinal = status.IsFinal,
                IsActive = true
            });
        }

        await dbContext.SaveChangesAsync();
    }
    private static async Task SeedPrintTemplatesAsync(ApplicationDbContext dbContext)
    {
        // Domyślny szablon raportu rozliczeniowego jest tworzony tylko podczas pierwszej inicjalizacji systemu
        var exists = await dbContext.PrintTemplates.AnyAsync(x => x.Code == GroupSettlementProformaTemplateCode);

        if (exists)
        {
            return;
        }

        dbContext.PrintTemplates.Add(new PrintTemplate
        {
            Id = Guid.NewGuid(),
            Code = GroupSettlementProformaTemplateCode,
            Name = "Dokument rozliczeniowy proforma dla grupy",
            TitleTemplate = "Dokument rozliczeniowy proforma - {{GroupName}}",
            BodyTemplate = "Podsumowanie usług cateringowych dla grupy {{GroupName}} za okres {{DateFrom}} - {{DateTo}}. Liczba zamówień: {{TotalOrders}}, kwota do rozliczenia: {{TotalAmount}}.",
            FooterTemplate = "Dokument ma charakter informacyjny i nie jest fakturą VAT.",
            IsActive = true
        });

        await dbContext.SaveChangesAsync();
    }
}
