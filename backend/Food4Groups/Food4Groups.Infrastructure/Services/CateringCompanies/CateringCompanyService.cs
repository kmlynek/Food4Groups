using Food4Groups.Application.DTOs.CateringCompanies;
using Food4Groups.Application.Interfaces.CateringCompanies;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.CateringCompanies;

public class CateringCompanyService : ICateringCompanyService
{
    private readonly ApplicationDbContext _context;

    public CateringCompanyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<CateringCompanyResponse>> GetAllAsync()
    {
        // Firma cateringowa jest głównym właścicielem oferty, grup, menu i rozliczeń
        return await _context.CateringCompanies
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new CateringCompanyResponse
            {
                Id = x.Id,
                Name = x.Name,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<CateringCompanyResponse?> GetByIdAsync(Guid id)
    {
        return await _context.CateringCompanies
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new CateringCompanyResponse
            {
                Id = x.Id,
                Name = x.Name,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<CateringCompanyResponse> CreateAsync(CreateCateringCompanyRequest request)
    {
        ValidateCompanyRequest(request.Name);

        // Nowa firma cateringowa jest domyślnie aktywna i może zostać wykorzystana w konfiguracji systemu
        var company = new CateringCompany
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            IsActive = true
        };

        _context.CateringCompanies.Add(company);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(company.Id))!;
    }

    public async Task<CateringCompanyResponse?> UpdateAsync(Guid id, UpdateCateringCompanyRequest request)
    {
        var company = await _context.CateringCompanies.FirstOrDefaultAsync(x => x.Id == id);

        if (company is null)
            return null;

        ValidateCompanyRequest(request.Name);

        company.Name = request.Name.Trim();
        company.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        company.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(company.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var company = await _context.CateringCompanies.FirstOrDefaultAsync(x => x.Id == id);

        if (company is null)
            return false;

        await EnsureCompanyIsNotUsedAsync(id);

        _context.CateringCompanies.Remove(company);
        await _context.SaveChangesAsync();

        return true;
    }

    private static void ValidateCompanyRequest(string? name)
    {
        // Walidacja po stronie serwisu zabezpiecza logikę aplikacji niezależnie od źródła danych
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required");
    }

    private async Task EnsureCompanyIsNotUsedAsync(Guid companyId)
    {
        // Firma cateringowa posiadająca powiązane dane biznesowe nie może zostać usunięta
        var isUsed =
            await _context.Groups.AnyAsync(x => x.CateringCompanyId == companyId) ||
            await _context.Packages.AnyAsync(x => x.CateringCompanyId == companyId) ||
            await _context.Dishes.AnyAsync(x => x.CateringCompanyId == companyId) ||
            await _context.Addons.AnyAsync(x => x.CateringCompanyId == companyId) ||
            await _context.MenuPeriods.AnyAsync(x => x.CateringCompanyId == companyId) ||
            await _context.SettlementPeriods.AnyAsync(x => x.CateringCompanyId == companyId);

        if (isUsed)
            throw new InvalidOperationException("Catering company is used by other records and cannot be deleted");
    }
}