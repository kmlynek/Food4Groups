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
    //oraz daje dostęp do danych w kodzie - DI, LINQ (np. context.Dishes.Where)

    //Właściwość (property), która udostępnia zestaw danych (DbSet) dla jednostek typu Dish
    //DbSet - rejestracja encji w modelu EF Core
    public DbSet<Dish> Dishes => Set<Dish>();
    public DbSet<Addon> Addons => Set<Addon>();
    public DbSet<CateringCompany> CateringCompanies => Set<CateringCompany>();
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<GroupMember> GroupMembers => Set<GroupMember>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<GroupPackageAssignment> GroupPackageAssignments => Set<GroupPackageAssignment>();
    public DbSet<MenuPeriod> MenuPeriods => Set<MenuPeriod>();
    public DbSet<MenuDay> Menus => Set<MenuDay>();
    public DbSet<MenuItem> MenuItems => Set<MenuItem>();
    public DbSet<MenuDayAddon> MenuDayAddons => Set<MenuDayAddon>();
    public DbSet<PackageDish> PackageDishes => Set<PackageDish>();
    public DbSet<PackageAddon> PackageAddons => Set<PackageAddon>();
    public DbSet<OrderStatus> OrderStatuses => Set<OrderStatus>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderAddon> OrderAddons => Set<OrderAddon>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();
    public DbSet<SettlementPeriod> SettlementPeriods => Set<SettlementPeriod>();
    public DbSet<GroupSettlement> GroupSettlements => Set<GroupSettlement>();
    public DbSet<SettlementLine> SettlementLines => Set<SettlementLine>();
    

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Automatycznie ładuje wszystkie konfiguracje IEntityTypeConfiguration
        // z assembly projektu Infrastructure.
        builder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}