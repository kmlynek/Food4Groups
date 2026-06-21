using Food4Groups.Application.DTOs.PackageDishes;

namespace Food4Groups.Application.Interfaces.PackageDishes;

public interface IPackageDishService
{
    Task<List<PackageDishResponse>> GetAllAsync();
    Task<List<PackageDishResponse>> GetByPackageIdAsync(Guid packageId);
    Task<PackageDishResponse?> GetByIdAsync(Guid id);
    Task<PackageDishResponse> CreateAsync(CreatePackageDishRequest request);
    Task<PackageDishResponse?> UpdateAsync(Guid id, UpdatePackageDishRequest request);
    Task<bool> DeleteAsync(Guid id);
}