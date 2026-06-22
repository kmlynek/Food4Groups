using Food4Groups.Application.DTOs.MenuPeriods;
using Food4Groups.Application.Interfaces.MenuPeriods;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.MenuPeriods;

public class MenuPeriodService : IMenuPeriodService
{
    private readonly ApplicationDbContext _context;

    public MenuPeriodService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<MenuPeriodResponse>> GetAllAsync()
    {
        // Okres menu grupuje dni menu w ramach konkretnego zakresu dat oferty lunchowej
        return await _context.MenuPeriods
            .AsNoTracking()
            .OrderByDescending(x => x.StartDate)
            .Select(x => new MenuPeriodResponse
            {
                Id = x.Id,
                CateringCompanyId = x.CateringCompanyId,
                CateringCompanyName = x.CateringCompany != null ? x.CateringCompany.Name : null,
                Name = x.Name,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<MenuPeriodResponse>> GetByCateringCompanyIdAsync(Guid cateringCompanyId)
    {
        return await _context.MenuPeriods
            .AsNoTracking()
            .Where(x => x.CateringCompanyId == cateringCompanyId)
            .OrderByDescending(x => x.StartDate)
            .Select(x => new MenuPeriodResponse
            {
                Id = x.Id,
                CateringCompanyId = x.CateringCompanyId,
                CateringCompanyName = x.CateringCompany != null ? x.CateringCompany.Name : null,
                Name = x.Name,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<MenuPeriodResponse?> GetByIdAsync(Guid id)
    {
        return await _context.MenuPeriods
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new MenuPeriodResponse
            {
                Id = x.Id,
                CateringCompanyId = x.CateringCompanyId,
                CateringCompanyName = x.CateringCompany != null ? x.CateringCompany.Name : null,
                Name = x.Name,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<MenuPeriodResponse> CreateAsync(CreateMenuPeriodRequest request)
    {
        await ValidateMenuPeriodRequestAsync(request.CateringCompanyId, request.Name, request.StartDate, request.EndDate);

        // Nowy okres menu jest domyślnie aktywny i może zostać wykorzystany do tworzenia dni menu
        var menuPeriod = new MenuPeriod
        {
            Id = Guid.NewGuid(),
            CateringCompanyId = request.CateringCompanyId,
            Name = request.Name.Trim(),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            IsActive = true
        };

        _context.MenuPeriods.Add(menuPeriod);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(menuPeriod.Id))!;
    }

    public async Task<MenuPeriodResponse?> UpdateAsync(Guid id, UpdateMenuPeriodRequest request)
    {
        var menuPeriod = await _context.MenuPeriods.FirstOrDefaultAsync(x => x.Id == id);

        if (menuPeriod is null)
            return null;

        await ValidateMenuPeriodRequestAsync(request.CateringCompanyId, request.Name, request.StartDate, request.EndDate);

        menuPeriod.CateringCompanyId = request.CateringCompanyId;
        menuPeriod.Name = request.Name.Trim();
        menuPeriod.StartDate = request.StartDate;
        menuPeriod.EndDate = request.EndDate;
        menuPeriod.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        menuPeriod.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(menuPeriod.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var menuPeriod = await _context.MenuPeriods.FirstOrDefaultAsync(x => x.Id == id);

        if (menuPeriod is null)
            return false;

        await EnsureMenuPeriodIsNotUsedAsync(id);

        _context.MenuPeriods.Remove(menuPeriod);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task ValidateMenuPeriodRequestAsync(Guid cateringCompanyId, string? name, DateTime startDate, DateTime endDate)
    {
        // Okres menu może zostać przypisany wyłącznie do istniejącej firmy cateringowej
        if (cateringCompanyId == Guid.Empty)
            throw new ArgumentException("CateringCompanyId is required");

        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required");

        if (startDate == default)
            throw new ArgumentException("StartDate is required");

        if (endDate == default)
            throw new ArgumentException("EndDate is required");

        // Data zakończenia okresu menu nie może być wcześniejsza niż data rozpoczęcia
        if (endDate < startDate)
            throw new ArgumentException("EndDate cannot be earlier than StartDate");

        var cateringCompanyExists = await _context.CateringCompanies
            .AnyAsync(x => x.Id == cateringCompanyId);

        if (!cateringCompanyExists)
            throw new KeyNotFoundException("Catering company not found");
    }

    private async Task EnsureMenuPeriodIsNotUsedAsync(Guid menuPeriodId)
    {
        // Okres menu posiadający zdefiniowane dni menu nie może zostać usunięty
        var isUsed = await _context.MenuDays.AnyAsync(x => x.MenuPeriodId == menuPeriodId);

        if (isUsed)
            throw new InvalidOperationException("Menu period is used by menu days and cannot be deleted");
    }
}