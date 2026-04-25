using Food4Groups.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<IdentityUser> //DbContext rozszerzony o Identity
{
    //Setup - sesja połączenia z bazą danych
    //ustawienia dla konkretnego DbContext <ApplicationDbContext> (może być więcej)
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    //Informuje EF Core, które encje (klasy domenowe) mają być mapowane w tabele
    //oraz daje dostęp do danych w kodzie - Dependency Injection, LINQ (np. context.Dishes.Where)
    
    //Właściwość (property), która udostępnia zestaw danych (DbSet) dla jednostek typu Dish
    public DbSet<Dish> Dishes => Set<Dish>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<FoodPackage> FoodPackages => Set<FoodPackage>();
    
}