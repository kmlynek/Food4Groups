using Food4Groups.Application.DTOs.Groups;
using Food4Groups.Application.Interfaces.Groups;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.Groups;

public class GroupService : IGroupService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;

    public GroupService(ApplicationDbContext context, UserManager<IdentityUser> userManager)
    {
        _context = context;
        _userManager = userManager;
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
                CoordinatorUserId = x.CoordinatorUserId,
                CoordinatorEmail = x.CoordinatorUserId != null
                    ? _context.Users
                        .Where(user => user.Id == x.CoordinatorUserId)
                        .Select(user => user.Email)
                        .FirstOrDefault()
                    : null,
                Name = x.Name,
                MemberCount = x.MemberCount,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<AvailableGroupCoordinatorResponse>> GetAvailableCoordinatorsAsync()
    {
        // Do grup przypisywani są użytkownicy z rolą GroupCoordinator
        var coordinators = await _userManager.GetUsersInRoleAsync("GroupCoordinator");

        return coordinators
            .OrderBy(x => x.Email)
            .Select(x => new AvailableGroupCoordinatorResponse
            {
                Id = x.Id,
                Email = x.Email
            })
            .ToList();
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
                CoordinatorUserId = x.CoordinatorUserId,
                CoordinatorEmail = x.CoordinatorUserId != null
                    ? _context.Users
                        .Where(user => user.Id == x.CoordinatorUserId)
                        .Select(user => user.Email)
                        .FirstOrDefault()
                    : null,
                Name = x.Name,
                MemberCount = x.MemberCount,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<GroupResponse> CreateAsync(CreateGroupRequest request)
    {
        var coordinatorUserId = await ValidateGroupRequestAsync(request.CateringCompanyId, request.Name, request.CoordinatorUserId, null);

        var group = new Group
        {
            Id = Guid.NewGuid(),
            CateringCompanyId = request.CateringCompanyId,
            CoordinatorUserId = coordinatorUserId,
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

        var coordinatorUserId = await ValidateGroupRequestAsync(request.CateringCompanyId, request.Name, request.CoordinatorUserId, id);

        group.CateringCompanyId = request.CateringCompanyId;
        group.CoordinatorUserId = coordinatorUserId;
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

    private async Task<string?> ValidateGroupRequestAsync(Guid cateringCompanyId, string? name, string? coordinatorUserId, Guid? currentGroupId)
    {
        // Walidacja po stronie serwisu zabezpiecza logikę aplikacji niezależnie od źródła danych
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Podaj nazwę grupy");

        if (cateringCompanyId == Guid.Empty)
            throw new ArgumentException("Wybierz firmę cateringową");

        // Grupa może zostać przypisana wyłącznie do istniejącej firmy cateringowej
        var cateringCompanyExists = await _context.CateringCompanies
            .AnyAsync(x => x.Id == cateringCompanyId);

        if (!cateringCompanyExists)
            throw new KeyNotFoundException("Nie znaleziono firmy cateringowej");

        if (string.IsNullOrWhiteSpace(coordinatorUserId))
            return null;

        var trimmedCoordinatorUserId = coordinatorUserId.Trim();

        var coordinator = await _userManager.FindByIdAsync(trimmedCoordinatorUserId);
        if (coordinator is null)
            throw new KeyNotFoundException("Nie znaleziono koordynatora");

        var isCoordinator = await _userManager.IsInRoleAsync(coordinator, "GroupCoordinator");
        if (!isCoordinator)
            throw new ArgumentException("Jako koordynatora można przypisać tylko użytkownika z rolą koordynatora grupy");

        // Jeden koordynator może być przypisany tylko do jednej grupy
        var coordinatorAlreadyAssigned = await _context.Groups.AnyAsync(x =>
            x.CoordinatorUserId == trimmedCoordinatorUserId &&
            (!currentGroupId.HasValue || x.Id != currentGroupId.Value));

        if (coordinatorAlreadyAssigned)
            throw new InvalidOperationException("Ten koordynator jest już przypisany do innej grupy");

        return trimmedCoordinatorUserId;
    }
}
