using Food4Groups.Application.DTOs.PackageDishes;
using Food4Groups.Application.Interfaces.PackageDishes;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.PackageDishes;

public class PackageDishService : IPackageDishService
{
    private readonly ApplicationDbContext _context;

    public PackageDishService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PackageDishResponse>> GetAllAsync()
    {
        // Lista pokazuje, które dania są dozwolone w konkretnych pakietach
        return await _context.PackageDishes
            .AsNoTracking()
            .OrderBy(x => x.Package!.Name)
            .ThenBy(x => x.Dish!.Name)
            .Select(x => new PackageDishResponse
            {
                Id = x.Id,
                PackageId = x.PackageId,
                PackageName = x.Package != null ? x.Package.Name : null,
                DishId = x.DishId,
                DishName = x.Dish != null ? x.Dish.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<PackageDishResponse>> GetByPackageIdAsync(Guid packageId)
    {
        return await _context.PackageDishes
            .AsNoTracking()
            .Where(x => x.PackageId == packageId)
            .OrderBy(x => x.Dish!.Name)
            .Select(x => new PackageDishResponse
            {
                Id = x.Id,
                PackageId = x.PackageId,
                PackageName = x.Package != null ? x.Package.Name : null,
                DishId = x.DishId,
                DishName = x.Dish != null ? x.Dish.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<PackageDishResponse?> GetByIdAsync(Guid id)
    {
        return await _context.PackageDishes
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new PackageDishResponse
            {
                Id = x.Id,
                PackageId = x.PackageId,
                PackageName = x.Package != null ? x.Package.Name : null,
                DishId = x.DishId,
                DishName = x.Dish != null ? x.Dish.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<PackageDishResponse> CreateAsync(CreatePackageDishRequest request)
    {
        await ValidatePackageDishRequestAsync(request.PackageId, request.DishId, null);

        // Nowe przypisanie dania do pakietu jest domyślnie aktywne
        var packageDish = new PackageDish
        {
            Id = Guid.NewGuid(),
            PackageId = request.PackageId,
            DishId = request.DishId,
            IsActive = true
        };

        _context.PackageDishes.Add(packageDish);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(packageDish.Id))!;
    }

    public async Task<PackageDishResponse?> UpdateAsync(Guid id, UpdatePackageDishRequest request)
    {
        var packageDish = await _context.PackageDishes.FirstOrDefaultAsync(x => x.Id == id);

        if (packageDish is null)
            return null;

        await ValidatePackageDishRequestAsync(request.PackageId, request.DishId, id);

        packageDish.PackageId = request.PackageId;
        packageDish.DishId = request.DishId;
        packageDish.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        packageDish.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(packageDish.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var packageDish = await _context.PackageDishes.FirstOrDefaultAsync(x => x.Id == id);

        if (packageDish is null)
            return false;

        _context.PackageDishes.Remove(packageDish);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task ValidatePackageDishRequestAsync(Guid packageId, Guid dishId, Guid? ignoredPackageDishId)
    {
        // Do pakietu może zostać przypisane wyłącznie aktywne danie z tej samej firmy cateringowej
        if (packageId == Guid.Empty)
            throw new ArgumentException("Wybierz pakiet");

        if (dishId == Guid.Empty)
            throw new ArgumentException("Wybierz danie");

        var package = await _context.Packages
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == packageId);

        if (package is null)
            throw new KeyNotFoundException("Nie znaleziono pakietu");

        if (!package.IsActive)
            throw new InvalidOperationException("Nie można zmieniać zawartości nieaktywnego pakietu");

        var dish = await _context.Dishes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == dishId);

        if (dish is null)
            throw new KeyNotFoundException("Nie znaleziono dania");

        if (!dish.IsActive)
            throw new InvalidOperationException("Nie można dodać nieaktywnego dania do pakietu");

        if (package.CateringCompanyId != dish.CateringCompanyId)
            throw new InvalidOperationException("Pakiet i danie muszą należeć do tej samej firmy cateringowej");

        // Jedno danie nie może zostać przypisane wielokrotnie do tego samego pakietu
        var duplicateExists = await _context.PackageDishes
            .AnyAsync(x =>
                x.PackageId == packageId &&
                x.DishId == dishId &&
                (!ignoredPackageDishId.HasValue || x.Id != ignoredPackageDishId.Value));

        if (duplicateExists)
            throw new InvalidOperationException("To danie jest już dodane do pakietu");
    }
}
