using Food4Groups.Application.DTOs.Addons;

namespace Food4Groups.Application.Interfaces.Addons;

public interface IAddonService
{
    Task<List<ActiveAddonResponse>> GetAllActiveAsync();
    Task<List<AddonResponse>> GetAllAsync();
    Task<ActiveAddonResponse?> GetActiveByIdAsync(Guid id);
    Task<AddonResponse?> GetByIdAsync(Guid id);
    Task<AddonResponse> CreateAsync(CreateAddonRequest request);
    Task<AddonResponse?> UpdateAsync(Guid id, UpdateAddonRequest request);
    Task<bool> DeleteAsync(Guid id);
}