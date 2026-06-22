using Food4Groups.Application.DTOs.MenuDayAddons;
using Food4Groups.Application.Interfaces.MenuDayAddons;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.MenuDayAddons;

public class MenuDayAddonService : IMenuDayAddonService
{
    private readonly ApplicationDbContext _context;

    public MenuDayAddonService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MenuDayAddonResponse>> GetAllAsync()
    {
        // Dodatki menu określają, które opcje dodatkowe są dostępne w konkretnym dniu
        return await _context.MenuDayAddons
            .AsNoTracking()
            .OrderByDescending(x => x.MenuDay!.MenuDate)
            .ThenBy(x => x.Addon!.Name)
            .Select(x => new MenuDayAddonResponse
            {
                Id = x.Id,
                MenuDayId = x.MenuDayId,
                MenuDate = x.MenuDay != null ? x.MenuDay.MenuDate : null,
                AddonId = x.AddonId,
                AddonName = x.Addon != null ? x.Addon.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<MenuDayAddonResponse>> GetByMenuDayIdAsync(Guid menuDayId)
    {
        return await _context.MenuDayAddons
            .AsNoTracking()
            .Where(x => x.MenuDayId == menuDayId)
            .OrderBy(x => x.Addon!.Name)
            .Select(x => new MenuDayAddonResponse
            {
                Id = x.Id,
                MenuDayId = x.MenuDayId,
                MenuDate = x.MenuDay != null ? x.MenuDay.MenuDate : null,
                AddonId = x.AddonId,
                AddonName = x.Addon != null ? x.Addon.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<MenuDayAddonResponse?> GetByIdAsync(Guid id)
    {
        return await _context.MenuDayAddons
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new MenuDayAddonResponse
            {
                Id = x.Id,
                MenuDayId = x.MenuDayId,
                MenuDate = x.MenuDay != null ? x.MenuDay.MenuDate : null,
                AddonId = x.AddonId,
                AddonName = x.Addon != null ? x.Addon.Name : null,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<MenuDayAddonResponse> CreateAsync(CreateMenuDayAddonRequest request)
    {
        await ValidateMenuDayAddonRequestAsync(request.MenuDayId, request.AddonId, null);

        var menuDayAddon = new MenuDayAddon
        {
            Id = Guid.NewGuid(),
            MenuDayId = request.MenuDayId,
            AddonId = request.AddonId,
            IsActive = true
        };

        _context.MenuDayAddons.Add(menuDayAddon);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(menuDayAddon.Id))!;
    }

    public async Task<MenuDayAddonResponse?> UpdateAsync(Guid id, UpdateMenuDayAddonRequest request)
    {
        var menuDayAddon = await _context.MenuDayAddons.FirstOrDefaultAsync(x => x.Id == id);
        if (menuDayAddon is null)
            return null;

        await ValidateMenuDayAddonRequestAsync(request.MenuDayId, request.AddonId, id);

        menuDayAddon.MenuDayId = request.MenuDayId;
        menuDayAddon.AddonId = request.AddonId;
        menuDayAddon.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        menuDayAddon.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(menuDayAddon.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var menuDayAddon = await _context.MenuDayAddons.FirstOrDefaultAsync(x => x.Id == id);
        if (menuDayAddon is null)
            return false;

        await EnsureMenuDayAddonIsNotUsedAsync(id);

        _context.MenuDayAddons.Remove(menuDayAddon);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task ValidateMenuDayAddonRequestAsync(Guid menuDayId, Guid addonId, Guid? ignoredMenuDayAddonId)
    {
        // Walidacja pilnuje, aby do dnia menu trafił aktywny dodatek z tej samej firmy cateringowej
        if (menuDayId == Guid.Empty)
            throw new ArgumentException("MenuDayId is required");

        if (addonId == Guid.Empty)
            throw new ArgumentException("AddonId is required");

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

        var addon = await _context.Addons
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == addonId);

        if (addon is null)
            throw new KeyNotFoundException("Addon not found");

        if (!addon.IsActive)
            throw new InvalidOperationException("Inactive addon cannot be assigned to menu day");

        if (menuDay.MenuPeriod.CateringCompanyId != addon.CateringCompanyId)
            throw new InvalidOperationException("Menu day and addon must belong to the same catering company");

        var duplicateExists = await _context.MenuDayAddons
            .AnyAsync(x =>
                x.MenuDayId == menuDayId &&
                x.AddonId == addonId &&
                (!ignoredMenuDayAddonId.HasValue || x.Id != ignoredMenuDayAddonId.Value));

        if (duplicateExists)
            throw new InvalidOperationException("Addon is already assigned to this menu day");
    }

    private async Task EnsureMenuDayAddonIsNotUsedAsync(Guid menuDayAddonId)
    {
        // Jeśli dodatek został już wybrany w zamówieniu, pozycja menu nie jest usuwana
        var menuDayAddon = await _context.MenuDayAddons
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == menuDayAddonId);

        if (menuDayAddon is null)
            return;

        var isUsed = await _context.OrderAddons
            .AnyAsync(x => x.AddonId == menuDayAddon.AddonId && x.Order != null && x.Order.MenuDayId == menuDayAddon.MenuDayId);

        if (isUsed)
            throw new InvalidOperationException("Menu day addon is used by orders and cannot be deleted");
    }
}