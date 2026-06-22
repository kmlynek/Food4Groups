using Food4Groups.Application.DTOs.MenuItems;

namespace Food4Groups.Application.Interfaces.MenuItems;

public interface IMenuItemService
{
    Task<List<MenuItemResponse>> GetAllAsync();
    Task<List<MenuItemResponse>> GetByMenuDayIdAsync(Guid menuDayId);
    Task<MenuItemResponse?> GetByIdAsync(Guid id);
    Task<MenuItemResponse> CreateAsync(CreateMenuItemRequest request);
    Task<MenuItemResponse?> UpdateAsync(Guid id, UpdateMenuItemRequest request);
    Task<bool> DeleteAsync(Guid id);
}