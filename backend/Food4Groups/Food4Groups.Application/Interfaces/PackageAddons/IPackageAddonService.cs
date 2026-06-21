using Food4Groups.Application.DTOs.PackageAddons;

namespace Food4Groups.Application.Interfaces.PackageAddons;

public interface IPackageAddonService
{
    Task<List<PackageAddonResponse>> GetAllAsync();
    Task<List<PackageAddonResponse>> GetByPackageIdAsync(Guid packageId);
    Task<PackageAddonResponse?> GetByIdAsync(Guid id);
    Task<PackageAddonResponse> CreateAsync(CreatePackageAddonRequest request);
    Task<PackageAddonResponse?> UpdateAsync(Guid id, UpdatePackageAddonRequest request);
    Task<bool> DeleteAsync(Guid id);
}