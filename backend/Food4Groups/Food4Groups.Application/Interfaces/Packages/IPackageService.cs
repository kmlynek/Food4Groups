using Food4Groups.Application.DTOs.Packages;

namespace Food4Groups.Application.Interfaces.Packages;

public interface IPackageService
{
    Task<List<PackageResponse>> GetAllAsync();
    Task<PackageResponse?> GetByIdAsync(Guid id);
    Task<PackageResponse> CreateAsync(CreatePackageRequest request);
    Task<PackageResponse?> UpdateAsync(Guid id, UpdatePackageRequest request);
    Task<bool> DeleteAsync(Guid id);

}