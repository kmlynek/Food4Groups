using Food4Groups.Application.DTOs.MenuItems;
using Food4Groups.Application.Interfaces.MenuItems;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.MenuItems;

public class MenuItemService : IMenuItemService
{
    private readonly ApplicationDbContext _context;

    public MenuItemService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MenuItemResponse>> GetAllAsync()
    {
        // Pozycje menu określają, które dania są dostępne w konkretnym dniu
        return await _context.MenuItems
            .AsNoTracking()
            .OrderByDescending(x => x.MenuDay!.MenuDate)
            .ThenBy(x => x.Dish!.Name)
            .Select(x => new MenuItemResponse
            {
                Id = x.Id,
                MenuDayId = x.MenuDayId,
                MenuDate = x.MenuDay != null ? x.MenuDay.MenuDate : null,
                DishId = x.DishId,
                DishName = x.Dish != null ? x.Dish.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<MenuItemResponse>> GetByMenuDayIdAsync(Guid menuDayId)
    {
        return await _context.MenuItems
            .AsNoTracking()
            .Where(x => x.MenuDayId == menuDayId)
            .OrderBy(x => x.Dish!.Name)
            .Select(x => new MenuItemResponse
            {
                Id = x.Id,
                MenuDayId = x.MenuDayId,
                MenuDate = x.MenuDay != null ? x.MenuDay.MenuDate : null,
                DishId = x.DishId,
                DishName = x.Dish != null ? x.Dish.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<MenuItemResponse?> GetByIdAsync(Guid id)
    {
        return await _context.MenuItems
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new MenuItemResponse
            {
                Id = x.Id,
                MenuDayId = x.MenuDayId,
                MenuDate = x.MenuDay != null ? x.MenuDay.MenuDate : null,
                DishId = x.DishId,
                DishName = x.Dish != null ? x.Dish.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<MenuItemResponse> CreateAsync(CreateMenuItemRequest request)
    {
        await ValidateMenuItemRequestAsync(request.MenuDayId, request.DishId, null);

        var menuItem = new MenuItem
        {
            Id = Guid.NewGuid(),
            MenuDayId = request.MenuDayId,
            DishId = request.DishId,
            IsActive = true
        };

        _context.MenuItems.Add(menuItem);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(menuItem.Id))!;
    }

    public async Task<MenuItemResponse?> UpdateAsync(Guid id, UpdateMenuItemRequest request)
    {
        var menuItem = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (menuItem is null)
            return null;

        await ValidateMenuItemRequestAsync(request.MenuDayId, request.DishId, id);

        menuItem.MenuDayId = request.MenuDayId;
        menuItem.DishId = request.DishId;
        menuItem.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        menuItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(menuItem.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var menuItem = await _context.MenuItems.FirstOrDefaultAsync(x => x.Id == id);
        if (menuItem is null)
            return false;

        await EnsureMenuItemIsNotUsedAsync(id);

        _context.MenuItems.Remove(menuItem);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task ValidateMenuItemRequestAsync(Guid menuDayId, Guid dishId, Guid? ignoredMenuItemId)
    {
        // Walidacja pilnuje, aby do dnia menu trafiło aktywne danie z tej samej firmy cateringowej
        if (menuDayId == Guid.Empty)
            throw new ArgumentException("MenuDayId is required");

        if (dishId == Guid.Empty)
            throw new ArgumentException("DishId is required");

        var menuDay = await _context.MenuDays
            .AsNoTracking()
            .Include(x => x.MenuPeriod)
            .FirstOrDefaultAsync(x => x.Id == menuDayId);

        if (menuDay is null)
            throw new KeyNotFoundException("Menu day not found");

        if (!menuDay.IsActive)
            throw new InvalidOperationException("Inactive menu day cannot be used");

        if (menuDay.MenuPeriod is null || !menuDay.MenuPeriod.IsActive)
            throw new InvalidOperationException("Inactive menu period cannot be used");

        var dish = await _context.Dishes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == dishId);

        if (dish is null)
            throw new KeyNotFoundException("Dish not found");

        if (!dish.IsActive)
            throw new InvalidOperationException("Inactive dish cannot be assigned to menu day");

        if (menuDay.MenuPeriod.CateringCompanyId != dish.CateringCompanyId)
            throw new InvalidOperationException("Menu day and dish must belong to the same catering company");

        var duplicateExists = await _context.MenuItems
            .AnyAsync(x =>
                x.MenuDayId == menuDayId &&
                x.DishId == dishId &&
                (!ignoredMenuItemId.HasValue || x.Id != ignoredMenuItemId.Value));

        if (duplicateExists)
            throw new InvalidOperationException("Dish is already assigned to this menu day");
    }

    private async Task EnsureMenuItemIsNotUsedAsync(Guid menuItemId)
    {
        // Jeśli dane danie zostało już wybrane w zamówieniu, pozycja nie jest fizycznie usuwana
        var menuItem = await _context.MenuItems
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == menuItemId);

        if (menuItem is null)
            return;

        var isUsed = await _context.Orders
            .AnyAsync(x => x.MenuDayId == menuItem.MenuDayId && x.DishId == menuItem.DishId);

        if (isUsed)
            throw new InvalidOperationException("Menu item is used by orders and cannot be deleted");
    }
}
