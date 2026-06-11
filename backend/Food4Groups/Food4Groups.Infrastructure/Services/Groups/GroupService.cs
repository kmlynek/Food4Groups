using Food4Groups.Application.DTOs.Groups;
using Food4Groups.Application.Interfaces.Groups;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.Groups;

public class GroupService : IGroupService
{
    private readonly ApplicationDbContext _context;

    public GroupService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GroupResponse>> GetAllAsync()
    {
        // Lista wszystkich grup jest dostępna dla administratora oraz pracownika cateringu
        return await _context.Groups
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new GroupResponse
            {
                Id = x.Id,
                CateringCompanyId = x.CateringCompanyId,
                CateringCompanyName = x.CateringCompany != null ? x.CateringCompany.Name : null,
                Name = x.Name,
                MemberCount = x.MemberCount,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<GroupResponse?> GetByIdAsync(Guid id)
    {
        return await _context.Groups
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new GroupResponse
            {
                Id = x.Id,
                CateringCompanyId = x.CateringCompanyId,
                CateringCompanyName = x.CateringCompany != null ? x.CateringCompany.Name : null,
                Name = x.Name,
                MemberCount = x.MemberCount,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<GroupResponse> CreateAsync(CreateGroupRequest request)
    {
        await ValidateGroupRequestAsync(request.CateringCompanyId, request.Name);

        var group = new Group
        {
            Id = Guid.NewGuid(),
            CateringCompanyId = request.CateringCompanyId,
            Name = request.Name.Trim(),

            // Liczba członków grupy jest wyliczana automatycznie na podstawie przypisanych użytkowników
            MemberCount = 0
        };

        _context.Groups.Add(group);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(group.Id))!;
    }

    public async Task<GroupResponse?> UpdateAsync(Guid id, UpdateGroupRequest request)
    {
        var group = await _context.Groups.FirstOrDefaultAsync(x => x.Id == id);

        if (group is null)
            return null;

        await ValidateGroupRequestAsync(request.CateringCompanyId, request.Name);

        group.CateringCompanyId = request.CateringCompanyId;
        group.Name = request.Name.Trim();

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        group.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(group.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var group = await _context.Groups.FirstOrDefaultAsync(x => x.Id == id);

        if (group is null)
            return false;

        _context.Groups.Remove(group);
        await _context.SaveChangesAsync();

        return true;
    }

    private async Task ValidateGroupRequestAsync(Guid cateringCompanyId, string? name)
    {
        // Walidacja po stronie serwisu zabezpiecza logikę aplikacji niezależnie od źródła danych
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name is required");

        if (cateringCompanyId == Guid.Empty)
            throw new ArgumentException("CateringCompanyId is required");

        // Grupa może zostać przypisana wyłącznie do istniejącej firmy cateringowej
        var cateringCompanyExists = await _context.CateringCompanies
            .AnyAsync(x => x.Id == cateringCompanyId);

        if (!cateringCompanyExists)
            throw new KeyNotFoundException("Catering company not found");
    }
}