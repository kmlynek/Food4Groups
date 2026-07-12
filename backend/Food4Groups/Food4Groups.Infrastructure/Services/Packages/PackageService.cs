using Food4Groups.Application.DTOs.Packages;
using Food4Groups.Application.Interfaces.Packages;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.Packages;

public class PackageService : IPackageService
{
    private readonly ApplicationDbContext _context;

    public PackageService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PackageResponse>> GetAllAsync()
    {
        // Pakiety określają zakres oferty dostępnej dla przypisanych grup
        return await _context.Packages
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new PackageResponse
            {
                Id = x.Id,
                CateringCompanyId = x.CateringCompanyId,
                CateringCompanyName = x.CateringCompany != null ? x.CateringCompany.Name : null,
                Name = x.Name,
                PricePerPerson = x.PricePerPerson,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<PackageResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Packages
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new PackageResponse
            {
                Id = x.Id,
                CateringCompanyId = x.CateringCompanyId,
                CateringCompanyName = x.CateringCompany != null ? x.CateringCompany.Name : null,
                Name = x.Name,
                PricePerPerson = x.PricePerPerson,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<PackageResponse> CreateAsync(CreatePackageRequest request)
    {
        await ValidatePackageRequestAsync(request.CateringCompanyId, request.Name, request.PricePerPerson);

        // Nowy pakiet jest domyślnie aktywny i może zostać przypisany do grupy
        var package = new Package
        {
            Id = Guid.NewGuid(),
            CateringCompanyId = request.CateringCompanyId,
            Name = request.Name.Trim(),
            PricePerPerson = request.PricePerPerson,
            IsActive = true
        };

        _context.Packages.Add(package);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(package.Id))!;
    }

    public async Task<PackageResponse?> UpdateAsync(Guid id, UpdatePackageRequest request)
    {
        var package = await _context.Packages.FirstOrDefaultAsync(x => x.Id == id);

        if (package is null)
            return null;

        await ValidatePackageRequestAsync(request.CateringCompanyId, request.Name, request.PricePerPerson);

        package.CateringCompanyId = request.CateringCompanyId;
        package.Name = request.Name.Trim();
        package.PricePerPerson = request.PricePerPerson;
        package.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        package.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(package.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var package = await _context.Packages.FirstOrDefaultAsync(x => x.Id == id);

        if (package is null)
            return false;

        _context.Packages.Remove(package);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task ValidatePackageRequestAsync(Guid cateringCompanyId, string? name, decimal pricePerPerson)
    {
        // Pakiet musi mieć nazwę, nieujemną cenę oraz istniejącą firmę cateringową
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Podaj nazwę pakietu");

        if (cateringCompanyId == Guid.Empty)
            throw new ArgumentException("Wybierz firmę cateringową");

        if (pricePerPerson < 0)
            throw new ArgumentException("Cena za osobę za dzień nie może być ujemna");

        var cateringCompanyExists = await _context.CateringCompanies
            .AnyAsync(x => x.Id == cateringCompanyId);

        if (!cateringCompanyExists)
            throw new KeyNotFoundException("Nie znaleziono firmy cateringowej");
    }
}
