using Food4Groups.Application.DTOs.MenuDayAddons;

namespace Food4Groups.Application.Interfaces.MenuDayAddons;

public interface IMenuDayAddonService
{
    Task<List<MenuDayAddonResponse>> GetAllAsync();
    Task<List<MenuDayAddonResponse>> GetByMenuDayIdAsync(Guid menuDayId);
    Task<MenuDayAddonResponse?> GetByIdAsync(Guid id);
    Task<MenuDayAddonResponse> CreateAsync(CreateMenuDayAddonRequest request);
    Task<MenuDayAddonResponse?> UpdateAsync(Guid id, UpdateMenuDayAddonRequest request);
    Task<bool> DeleteAsync(Guid id);
}