using Food4Groups.Application.DTOs.Addons;
using Food4Groups.Application.Interfaces.Addons;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.Addons;

public class AddonService : IAddonService
{
    private readonly ApplicationDbContext _context;

    public AddonService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ActiveAddonResponse>> GetAllActiveAsync()
    {
        // Klienci otrzymują wyłącznie aktywne dodatki oraz ograniczony zakres danych potrzebny do wyboru posiłku
        return await _context.Addons
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .Select(x => new ActiveAddonResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description
            })
            .ToListAsync();
    }

    public async Task<List<AddonResponse>> GetAllAsync()
    {
        // Role zarządzające otrzymują pełną listę dodatków w tym również pozycje nieaktywne
        return await _context.Addons
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new AddonResponse
            {
                Id = x.Id,
                CateringCompanyId = x.CateringCompanyId,
                CateringCompanyName = x.CateringCompany != null ? x.CateringCompany.Name : null,
                Name = x.Name,
                Description = x.Description,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<ActiveAddonResponse?> GetActiveByIdAsync(Guid id)
    {
        // Przy pobieraniu szczegółów dla klienta ponownie sprawdzany jest status aktywności dodatku
        return await _context.Addons
            .AsNoTracking()
            .Where(x => x.Id == id && x.IsActive)
            .Select(x => new ActiveAddonResponse
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description
            })
            .FirstOrDefaultAsync();
    }

    public async Task<AddonResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Addons
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new AddonResponse
            {
                Id = x.Id,
                CateringCompanyId = x.CateringCompanyId,
                CateringCompanyName = x.CateringCompany != null ? x.CateringCompany.Name : null,
                Name = x.Name,
                Description = x.Description,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<AddonResponse> CreateAsync(CreateAddonRequest request)
    {
        await ValidateAddonRequestAsync(request.CateringCompanyId, request.Name);

        // Nowo utworzony dodatek jest domyślnie aktywny i od razu może zostać wykorzystany w menu
        var addon = new Addon
        {
            Id = Guid.NewGuid(),
            CateringCompanyId = request.CateringCompanyId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsActive = true
        };

        _context.Addons.Add(addon);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(addon.Id))!;
    }

    public async Task<AddonResponse?> UpdateAsync(Guid id, UpdateAddonRequest request)
    {
        await ValidateAddonRequestAsync(request.CateringCompanyId, request.Name);

        var addon = await _context.Addons.FirstOrDefaultAsync(x => x.Id == id);
        if (addon is null)
            return null;

        addon.CateringCompanyId = request.CateringCompanyId;
        addon.Name = request.Name.Trim();
        addon.Description = request.Description?.Trim();

        // Status aktywności pozwala ukryć dodatek przed klientami bez konieczności jego fizycznego usuwania z bazy danych
        addon.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        addon.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(addon.Id))!;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var addon = await _context.Addons.FirstOrDefaultAsync(x => x.Id == id);

        if (addon is null)
            return false;

        _context.Addons.Remove(addon);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task ValidateAddonRequestAsync(Guid cateringCompanyId, string? name)
    {
        // Walidacja po stronie serwisu zabezpiecza logikę aplikacji niezależnie od źródła danych
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Podaj nazwę dodatku");

        if (cateringCompanyId == Guid.Empty)
            throw new ArgumentException("Wybierz firmę cateringową");

        // Dodatek może zostać przypisany wyłącznie do istniejącej firmy cateringowej
        var cateringCompanyExists = await _context.CateringCompanies
            .AnyAsync(x => x.Id == cateringCompanyId);

        if (!cateringCompanyExists)
            throw new KeyNotFoundException("Nie znaleziono firmy cateringowej");
    }
}
