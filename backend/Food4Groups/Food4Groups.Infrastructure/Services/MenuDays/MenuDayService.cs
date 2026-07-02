using Food4Groups.Application.DTOs.MenuDays;
using Food4Groups.Application.Interfaces.MenuDays;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.MenuDays;

public class MenuDayService : IMenuDayService
{
    private readonly ApplicationDbContext _context;

    public MenuDayService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MenuDayResponse>> GetAllAsync()
    {
        // Dni menu są konkretnymi datami, dla których dietetyk układa ofertę lunchową
        return await _context.MenuDays
            .AsNoTracking()
            .OrderByDescending(x => x.MenuDate)
            .Select(x => new MenuDayResponse
            {
                Id = x.Id,
                MenuPeriodId = x.MenuPeriodId,
                MenuPeriodName = x.MenuPeriod != null ? x.MenuPeriod.Name : null,
                CateringCompanyId = x.MenuPeriod != null ? x.MenuPeriod.CateringCompanyId : Guid.Empty,
                CateringCompanyName = x.MenuPeriod != null && x.MenuPeriod.CateringCompany != null ? x.MenuPeriod.CateringCompany.Name : null,
                MenuDate = x.MenuDate,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<MenuDayResponse>> GetByMenuPeriodIdAsync(Guid menuPeriodId)
    {
        return await _context.MenuDays
            .AsNoTracking()
            .Where(x => x.MenuPeriodId == menuPeriodId)
            .OrderBy(x => x.MenuDate)
            .Select(x => new MenuDayResponse
            {
                Id = x.Id,
                MenuPeriodId = x.MenuPeriodId,
                MenuPeriodName = x.MenuPeriod != null ? x.MenuPeriod.Name : null,
                CateringCompanyId = x.MenuPeriod != null ? x.MenuPeriod.CateringCompanyId : Guid.Empty,
                CateringCompanyName = x.MenuPeriod != null && x.MenuPeriod.CateringCompany != null ? x.MenuPeriod.CateringCompany.Name : null,
                MenuDate = x.MenuDate,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<MenuDayResponse?> GetByIdAsync(Guid id)
    {
        return await _context.MenuDays
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new MenuDayResponse
            {
                Id = x.Id,
                MenuPeriodId = x.MenuPeriodId,
                MenuPeriodName = x.MenuPeriod != null ? x.MenuPeriod.Name : null,
                CateringCompanyId = x.MenuPeriod != null ? x.MenuPeriod.CateringCompanyId : Guid.Empty,
                CateringCompanyName = x.MenuPeriod != null && x.MenuPeriod.CateringCompany != null ? x.MenuPeriod.CateringCompany.Name : null,
                MenuDate = x.MenuDate,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<MenuDayResponse> CreateAsync(CreateMenuDayRequest request)
    {
        await ValidateMenuDayRequestAsync(request.MenuPeriodId, request.MenuDate, null);

        // Nowy dzień menu jest domyślnie aktywny i może zostać wykorzystany do budowy oferty
        var menuDay = new MenuDay
        {
            Id = Guid.NewGuid(),
            MenuPeriodId = request.MenuPeriodId,
            MenuDate = NormalizeDate(request.MenuDate),
            IsActive = true
        };

        _context.MenuDays.Add(menuDay);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(menuDay.Id))!;
    }

    public async Task<MenuDayResponse?> UpdateAsync(Guid id, UpdateMenuDayRequest request)
    {
        var menuDay = await _context.MenuDays.FirstOrDefaultAsync(x => x.Id == id);

        if (menuDay is null)
            return null;

        await ValidateMenuDayRequestAsync(request.MenuPeriodId, request.MenuDate, id);

        menuDay.MenuPeriodId = request.MenuPeriodId;
        menuDay.MenuDate = NormalizeDate(request.MenuDate);
        menuDay.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        menuDay.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(menuDay.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var menuDay = await _context.MenuDays.FirstOrDefaultAsync(x => x.Id == id);

        if (menuDay is null)
            return false;

        await EnsureMenuDayIsNotUsedAsync(id);

        _context.MenuDays.Remove(menuDay);
        await _context.SaveChangesAsync();

        return true;
    }

    private static DateTime NormalizeDate(DateTime value)
    {
        // Dzień menu jest zapisywany jako początek dnia w UTC
        return DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
    }

    private async Task ValidateMenuDayRequestAsync(Guid menuPeriodId, DateTime menuDate, Guid? ignoredMenuDayId)
    {
        // Dzień menu może zostać utworzony wyłącznie w istniejącym i aktywnym okresie menu
        if (menuPeriodId == Guid.Empty)
            throw new ArgumentException("MenuPeriodId is required");

        if (menuDate == default)
            throw new ArgumentException("MenuDate is required");

        var menuPeriod = await _context.MenuPeriods
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == menuPeriodId);

        if (menuPeriod is null)
            throw new KeyNotFoundException("Menu period not found");

        if (!menuPeriod.IsActive)
            throw new InvalidOperationException("Inactive menu period cannot be used");

        var normalizedMenuDate = NormalizeDate(menuDate);

        // Dzień menu musi mieścić się w zakresie dat zdefiniowanym dla okresu menu
        if (normalizedMenuDate < menuPeriod.StartDate.Date || normalizedMenuDate > menuPeriod.EndDate.Date)
            throw new InvalidOperationException("Menu date must be inside menu period date range");

        // W ramach jednego okresu menu dana data może wystąpić tylko raz
        var duplicateExists = await _context.MenuDays
            .AnyAsync(x =>
                x.MenuPeriodId == menuPeriodId &&
                x.MenuDate.Date == normalizedMenuDate &&
                (!ignoredMenuDayId.HasValue || x.Id != ignoredMenuDayId.Value));

        if (duplicateExists)
            throw new InvalidOperationException("Menu day already exists in this menu period");
    }

    private async Task EnsureMenuDayIsNotUsedAsync(Guid menuDayId)
    {
        // Dzień menu posiadający powiązane dania, dodatki lub zamówienia nie może zostać usunięty
        var isUsed =
            await _context.MenuItems.AnyAsync(x => x.MenuDayId == menuDayId) ||
            await _context.MenuDayAddons.AnyAsync(x => x.MenuDayId == menuDayId) ||
            await _context.Orders.AnyAsync(x => x.MenuDayId == menuDayId);

        if (isUsed)
            throw new InvalidOperationException("Menu day is used by menu items, addons or orders and cannot be deleted");
    }
}