using Food4Groups.Application.DTOs.MenuPeriods;

namespace Food4Groups.Application.Interfaces.MenuPeriods;

public interface IMenuPeriodService
{
    Task<List<MenuPeriodResponse>> GetAllAsync();
    Task<List<MenuPeriodResponse>> GetByCateringCompanyIdAsync(Guid cateringCompanyId);
    Task<MenuPeriodResponse?> GetByIdAsync(Guid id);
    Task<MenuPeriodResponse> CreateAsync(CreateMenuPeriodRequest request);
    Task<MenuPeriodResponse?> UpdateAsync(Guid id, UpdateMenuPeriodRequest request);
    Task<bool> DeleteAsync(Guid id);
}