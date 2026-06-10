using Food4Groups.Application.DTOs.Dishes;

namespace Food4Groups.Application.Interfaces.Dishes;

public interface IDishService
{
    Task<List<ActiveDishResponse>> GetAllActiveAsync();
    Task<List<DishResponse>> GetAllAsync();
    Task<ActiveDishResponse?> GetActiveByIdAsync(Guid id);
    Task<DishResponse?> GetByIdAsync(Guid id);
    Task<DishResponse> CreateAsync(CreateDishRequest request);
    Task<DishResponse?> UpdateAsync(Guid id, UpdateDishRequest request);
    Task<bool> DeleteAsync(Guid id);
}