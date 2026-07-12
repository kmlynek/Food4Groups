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

        // Nowa pozycja menu jest domyślnie aktywna i może zostać wykorzystana przez Klienta przy składaniu zamówienia
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
        // Do dnia menu może zostać przypisane wyłącznie aktywne danie z tej samej firmy cateringowej
        if (menuDayId == Guid.Empty)
            throw new ArgumentException("Wybierz dzień menu");

        if (dishId == Guid.Empty)
            throw new ArgumentException("Wybierz danie");

        var menuDay = await _context.MenuDays
            .AsNoTracking()
            .Include(x => x.MenuPeriod)
            .FirstOrDefaultAsync(x => x.Id == menuDayId);

        if (menuDay is null)
            throw new KeyNotFoundException("Nie znaleziono dnia menu");

        if (!menuDay.IsActive)
            throw new InvalidOperationException("Nie można zmieniać nieaktywnego dnia menu");

        if (menuDay.MenuPeriod is null || !menuDay.MenuPeriod.IsActive)
            throw new InvalidOperationException("Nie można zmieniać dnia w nieaktywnym okresie menu");

        var dish = await _context.Dishes
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == dishId);

        if (dish is null)
            throw new KeyNotFoundException("Nie znaleziono dania");

        if (!dish.IsActive)
            throw new InvalidOperationException("Nie można dodać nieaktywnego dania do dnia menu");

        if (menuDay.MenuPeriod.CateringCompanyId != dish.CateringCompanyId)
            throw new InvalidOperationException("Dzień menu i danie muszą należeć do tej samej firmy cateringowej");

        // Jedno danie nie może zostać przypisane wielokrotnie do tego samego dnia menu
        var duplicateExists = await _context.MenuItems
            .AnyAsync(x =>
                x.MenuDayId == menuDayId &&
                x.DishId == dishId &&
                (!ignoredMenuItemId.HasValue || x.Id != ignoredMenuItemId.Value));

        if (duplicateExists)
            throw new InvalidOperationException("To danie jest już dodane do dnia menu");
    }

    private async Task EnsureMenuItemIsNotUsedAsync(Guid menuItemId)
    {
        // Pozycja menu wykorzystana w zamówieniach nie może zostać fizycznie usunięta
        var menuItem = await _context.MenuItems
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == menuItemId);

        if (menuItem is null)
            return;

        var isUsed = await _context.Orders
            .AnyAsync(x => x.MenuDayId == menuItem.MenuDayId && x.DishId == menuItem.DishId);

        if (isUsed)
            throw new InvalidOperationException("Nie można usunąć dania z dnia menu, ponieważ zostało użyte w zamówieniu");
    }
}
