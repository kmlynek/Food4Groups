using Food4Groups.Application.DTOs.PackageAddons;
using Food4Groups.Application.Interfaces.PackageAddons;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.PackageAddons;

public class PackageAddonService : IPackageAddonService
{
    private readonly ApplicationDbContext _context;

    public PackageAddonService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PackageAddonResponse>> GetAllAsync()
    {
        // Lista pokazuje, które dodatki są dozwolone w konkretnych pakietach
        return await _context.PackageAddons
            .AsNoTracking()
            .OrderBy(x => x.Package!.Name)
            .ThenBy(x => x.Addon!.Name)
            .Select(x => new PackageAddonResponse
            {
                Id = x.Id,
                PackageId = x.PackageId,
                PackageName = x.Package != null ? x.Package.Name : null,
                AddonId = x.AddonId,
                AddonName = x.Addon != null ? x.Addon.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<PackageAddonResponse>> GetByPackageIdAsync(Guid packageId)
    {
        return await _context.PackageAddons
            .AsNoTracking()
            .Where(x => x.PackageId == packageId)
            .OrderBy(x => x.Addon!.Name)
            .Select(x => new PackageAddonResponse
            {
                Id = x.Id,
                PackageId = x.PackageId,
                PackageName = x.Package != null ? x.Package.Name : null,
                AddonId = x.AddonId,
                AddonName = x.Addon != null ? x.Addon.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<PackageAddonResponse?> GetByIdAsync(Guid id)
    {
        return await _context.PackageAddons
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new PackageAddonResponse
            {
                Id = x.Id,
                PackageId = x.PackageId,
                PackageName = x.Package != null ? x.Package.Name : null,
                AddonId = x.AddonId,
                AddonName = x.Addon != null ? x.Addon.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<PackageAddonResponse> CreateAsync(CreatePackageAddonRequest request)
    {
        await ValidatePackageAddonRequestAsync(request.PackageId, request.AddonId, null);

        var packageAddon = new PackageAddon
        {
            Id = Guid.NewGuid(),
            PackageId = request.PackageId,
            AddonId = request.AddonId,
            IsActive = true
        };

        _context.PackageAddons.Add(packageAddon);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(packageAddon.Id))!;
    }

    public async Task<PackageAddonResponse?> UpdateAsync(Guid id, UpdatePackageAddonRequest request)
    {
        var packageAddon = await _context.PackageAddons.FirstOrDefaultAsync(x => x.Id == id);
        if (packageAddon is null)
            return null;

        await ValidatePackageAddonRequestAsync(request.PackageId, request.AddonId, id);

        packageAddon.PackageId = request.PackageId;
        packageAddon.AddonId = request.AddonId;
        packageAddon.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        packageAddon.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(packageAddon.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var packageAddon = await _context.PackageAddons.FirstOrDefaultAsync(x => x.Id == id);
        if (packageAddon is null)
            return false;

        _context.PackageAddons.Remove(packageAddon);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task ValidatePackageAddonRequestAsync(Guid packageId, Guid addonId, Guid? ignoredPackageAddonId)
    {
        // Walidacja pilnuje, aby do pakietu trafił wyłącznie aktywny dodatek z tej samej firmy cateringowej
        if (packageId == Guid.Empty)
            throw new ArgumentException("PackageId is required");

        if (addonId == Guid.Empty)
            throw new ArgumentException("AddonId is required");

        var package = await _context.Packages
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == packageId);

        if (package is null)
            throw new KeyNotFoundException("Package not found");

        if (!package.IsActive)
            throw new InvalidOperationException("Inactive package cannot be used");

        var addon = await _context.Addons
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == addonId);

        if (addon is null)
            throw new KeyNotFoundException("Addon not found");

        if (!addon.IsActive)
            throw new InvalidOperationException("Inactive addon cannot be assigned to package");

        if (package.CateringCompanyId != addon.CateringCompanyId)
            throw new InvalidOperationException("Package and addon must belong to the same catering company");

        var duplicateExists = await _context.PackageAddons
            .AnyAsync(x =>
                x.PackageId == packageId &&
                x.AddonId == addonId &&
                (!ignoredPackageAddonId.HasValue || x.Id != ignoredPackageAddonId.Value));

        if (duplicateExists)
            throw new InvalidOperationException("Addon is already assigned to this package");
    }
}
