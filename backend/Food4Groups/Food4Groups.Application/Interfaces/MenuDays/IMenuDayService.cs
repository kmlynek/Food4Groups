using Food4Groups.Application.DTOs.MenuDays;

namespace Food4Groups.Application.Interfaces.MenuDays;

public interface IMenuDayService
{
    Task<List<MenuDayResponse>> GetAllAsync();
    Task<List<MenuDayResponse>> GetByMenuPeriodIdAsync(Guid menuPeriodId);
    Task<MenuDayResponse?> GetByIdAsync(Guid id);
    Task<MenuDayResponse> CreateAsync(CreateMenuDayRequest request);
    Task<MenuDayResponse?> UpdateAsync(Guid id, UpdateMenuDayRequest request);
    Task<bool> DeleteAsync(Guid id);
}