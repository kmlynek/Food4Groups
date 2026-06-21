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
        // Przy pobieraniu szczegółów dla użytkownika końcowego ponownie sprawdzany jest status aktywności dodatku
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
        ValidateAddonName(request.Name);

        // Nowo utworzony dodatek jest domyślnie aktywny i od razu może zostać wykorzystany w menu
        var addon = new Addon
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsActive = true
        };

        _context.Addons.Add(addon);
        await _context.SaveChangesAsync();

        return MapToResponse(addon);
    }

    public async Task<AddonResponse?> UpdateAsync(Guid id, UpdateAddonRequest request)
    {
        ValidateAddonName(request.Name);

        var addon = await _context.Addons.FirstOrDefaultAsync(x => x.Id == id);
        if (addon is null)
            return null;

        addon.Name = request.Name.Trim();
        addon.Description = request.Description?.Trim();

        // Status aktywności pozwala ukryć dodatek przed użytkownikami bez konieczności jego fizycznego usuwania z bazy danych
        addon.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        addon.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToResponse(addon);
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

    private static void ValidateAddonName(string? name)
    {
        // Walidacja po stronie serwisu zabezpiecza logikę aplikacji niezależnie od źródła danych
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required");
    }

    // Mapuje encję domenową na obiekt DTO zwracany przez API
    private static AddonResponse MapToResponse(Addon addon)
    {
        return new AddonResponse
        {
            Id = addon.Id,
            Name = addon.Name,
            Description = addon.Description,
            IsActive = addon.IsActive,
            CreatedAt = addon.CreatedAt,
            UpdatedAt = addon.UpdatedAt
        };
    }
}