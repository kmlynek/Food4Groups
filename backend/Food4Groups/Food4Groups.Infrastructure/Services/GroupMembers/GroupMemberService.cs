using Food4Groups.Application.DTOs.GroupMembers;
using Food4Groups.Application.Interfaces.GroupMembers;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.GroupMembers;

public class GroupMemberService : IGroupMemberService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;

    public GroupMemberService(ApplicationDbContext context, UserManager<IdentityUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<List<GroupMemberResponse>> GetAllAsync()
    {
        // Lista członków grupy jest przygotowana od razu pod widok administracyjny
        return await GetGroupMembersQuery()
            .OrderBy(x => x.GroupName)
            .ThenBy(x => x.UserEmail)
            .ToListAsync();
    }

    public async Task<List<AvailableGroupMemberResponse>> GetAvailableUsersAsync()
    {
        // Do grup są przypisywani klienci, stąd rola User dla listy pobranych użytkowników
        var users = await _userManager.GetUsersInRoleAsync("User");

        return users
            .OrderBy(x => x.Email)
            .Select(x => new AvailableGroupMemberResponse
            {
                Id = x.Id,
                Email = x.Email
            })
            .ToList();
    }

    public async Task<GroupMemberResponse?> GetByIdAsync(Guid id)
    {
        return await GetGroupMembersQuery()
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<GroupMemberResponse> CreateAsync(CreateGroupMemberRequest request)
    {
        var userId = await ValidateMemberRequestAsync(request.GroupId, request.UserId, null);

        var member = new GroupMember
        {
            Id = Guid.NewGuid(),
            GroupId = request.GroupId,
            UserId = userId,
            IsActive = true,
            JoinedAt = DateTime.UtcNow
        };

        _context.GroupMembers.Add(member);
        await _context.SaveChangesAsync();

        // Po dodaniu członka aktualizowana jest liczba aktywnych osób w grupie
        await RecalculateMemberCountAsync(request.GroupId);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(member.Id))!;
    }

    public async Task<GroupMemberResponse?> UpdateAsync(Guid id, UpdateGroupMemberRequest request)
    {
        var member = await _context.GroupMembers.FirstOrDefaultAsync(x => x.Id == id);
        if (member is null)
            return null;

        var userId = await ValidateMemberRequestAsync(request.GroupId, request.UserId, id);
        var previousGroupId = member.GroupId;

        member.GroupId = request.GroupId;
        member.UserId = userId;
        member.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        member.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Jeżeli klient został przeniesiony do innej grupy, liczba członków zostaje ponownie przeliczona w obu grupach
        await RecalculateMemberCountAsync(previousGroupId);
        if (previousGroupId != request.GroupId)
            await RecalculateMemberCountAsync(request.GroupId);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(member.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var member = await _context.GroupMembers.FirstOrDefaultAsync(x => x.Id == id);
        if (member is null)
            return false;

        var groupId = member.GroupId;

        await EnsureMemberHasNoOrdersAsync(id);
        
        _context.GroupMembers.Remove(member);
        await _context.SaveChangesAsync();

        // Po usunięciu członka ponownie przeliczana jest liczba osób w grupie
        await RecalculateMemberCountAsync(groupId);
        await _context.SaveChangesAsync();

        return true;
    }
    private async Task EnsureMemberHasNoOrdersAsync(Guid memberId)
    {
        // Uczestnik z historią zamówień nie może zostać fizycznie usunięty z systemu
        var hasOrders = await _context.Orders.AnyAsync(x => x.GroupMemberId == memberId);

        if (hasOrders)
            throw new InvalidOperationException("User cannot be deleted because have existing orders. Deactivate the membership instead of deleting.");
    }
    
    private IQueryable<GroupMemberResponse> GetGroupMembersQuery()
    {
        // Zapytanie łączy członkostwo z grupą i użytkownikiem Identity, aby zwrócić kompletne DTO do widoku
        return from member in _context.GroupMembers.AsNoTracking()
            join groupEntity in _context.Groups.AsNoTracking() on member.GroupId equals groupEntity.Id
            join user in _context.Users.AsNoTracking() on member.UserId equals user.Id
            select new GroupMemberResponse
            {
                Id = member.Id,
                GroupId = member.GroupId,
                GroupName = groupEntity.Name,
                UserId = member.UserId,
                UserEmail = user.Email,
                IsActive = member.IsActive,
                JoinedAt = member.JoinedAt,
                CreatedAt = member.CreatedAt,
                UpdatedAt = member.UpdatedAt
            };
    }

    private async Task<string> ValidateMemberRequestAsync(Guid groupId, string? userId, Guid? currentMemberId)
    {
        // Walidacja po stronie serwisu zabezpiecza logikę aplikacji niezależnie od źródła danych
        if (groupId == Guid.Empty)
            throw new ArgumentException("GroupId is required");

        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required");

        var trimmedUserId = userId.Trim();

        // Członek grupy może zostać dodany tylko do istniejącej grupy
        var groupExists = await _context.Groups.AnyAsync(x => x.Id == groupId);
        if (!groupExists)
            throw new KeyNotFoundException("Group not found");

        // Przypisywany klient musi istnieć w systemie Identity
        var user = await _userManager.FindByIdAsync(trimmedUserId);
        if (user is null)
            throw new KeyNotFoundException("User not found");

        var isClient = await _userManager.IsInRoleAsync(user, "User");
        if (!isClient)
            throw new ArgumentException("Only users with User role can be assigned as group members");

        // Jeden klient może należeć tylko do jednej grupy
        var userAlreadyAssigned = await _context.GroupMembers.AnyAsync(x =>
            x.UserId == trimmedUserId &&
            (!currentMemberId.HasValue || x.Id != currentMemberId.Value));

        if (userAlreadyAssigned)
            throw new InvalidOperationException("This user already belongs to a group");

        return trimmedUserId;
    }

    private async Task RecalculateMemberCountAsync(Guid groupId) // Przelicza liczbę członków w grupie
    {
        var group = await _context.Groups.FirstOrDefaultAsync(x => x.Id == groupId);
        if (group is null)
            return;

        // MemberCount jest wartością wyliczaną na podstawie aktywnych powiązań w tabeli GroupMembers
        group.MemberCount = await _context.GroupMembers
            .CountAsync(x => x.GroupId == groupId && x.IsActive);
    }
}