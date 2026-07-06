using Food4Groups.Application.DTOs.GroupPackageAssignments;
using Food4Groups.Application.Interfaces.GroupPackageAssignments;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.GroupPackageAssignments;

public class GroupPackageAssignmentService : IGroupPackageAssignmentService
{
    private readonly ApplicationDbContext _context;

    public GroupPackageAssignmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<GroupPackageAssignmentResponse>> GetAllAsync()
    {
        // Lista przypisań pokazuje, jaki pakiet obowiązuje dla konkretnej grupy w danym okresie
        return await _context.GroupPackageAssignments
            .AsNoTracking()
            .OrderBy(x => x.Group!.Name)
            .ThenByDescending(x => x.ActiveFrom)
            .Select(x => new GroupPackageAssignmentResponse
            {
                Id = x.Id,
                GroupId = x.GroupId,
                GroupName = x.Group != null ? x.Group.Name : null,
                PackageId = x.PackageId,
                PackageName = x.Package != null ? x.Package.Name : null,
                PackagePricePerPerson = x.Package != null ? x.Package.PricePerPerson : 0,
                ActiveFrom = x.ActiveFrom,
                ActiveTo = x.ActiveTo,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<List<GroupPackageAssignmentResponse>> GetByGroupIdAsync(Guid groupId)
    {
        return await _context.GroupPackageAssignments
            .AsNoTracking()
            .Where(x => x.GroupId == groupId)
            .OrderByDescending(x => x.ActiveFrom)
            .Select(x => new GroupPackageAssignmentResponse
            {
                Id = x.Id,
                GroupId = x.GroupId,
                GroupName = x.Group != null ? x.Group.Name : null,
                PackageId = x.PackageId,
                PackageName = x.Package != null ? x.Package.Name : null,
                PackagePricePerPerson = x.Package != null ? x.Package.PricePerPerson : 0,
                ActiveFrom = x.ActiveFrom,
                ActiveTo = x.ActiveTo,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<GroupPackageAssignmentResponse?> GetByIdAsync(Guid id)
    {
        return await _context.GroupPackageAssignments
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new GroupPackageAssignmentResponse
            {
                Id = x.Id,
                GroupId = x.GroupId,
                GroupName = x.Group != null ? x.Group.Name : null,
                PackageId = x.PackageId,
                PackageName = x.Package != null ? x.Package.Name : null,
                PackagePricePerPerson = x.Package != null ? x.Package.PricePerPerson : 0,
                ActiveFrom = x.ActiveFrom,
                ActiveTo = x.ActiveTo,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<GroupPackageAssignmentResponse> CreateAsync(CreateGroupPackageAssignmentRequest request)
    {
        var activeFrom = NormalizeDate(request.ActiveFrom);
        var activeTo = NormalizeOptionalDate(request.ActiveTo);

        await ValidateAssignmentRequestAsync(request.GroupId, request.PackageId, activeFrom, activeTo);
        await EnsureNoActiveOverlapAsync(request.GroupId, activeFrom, activeTo, null);

        // Nowe przypisanie pakietu do grupy jest domyślnie aktywne
        var assignment = new GroupPackageAssignment
        {
            Id = Guid.NewGuid(),
            GroupId = request.GroupId,
            PackageId = request.PackageId,
            ActiveFrom = activeFrom,
            ActiveTo = activeTo,
            IsActive = true
        };

        _context.GroupPackageAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        return (await GetByIdAsync(assignment.Id))!;
    }

    public async Task<GroupPackageAssignmentResponse?> UpdateAsync(Guid id, UpdateGroupPackageAssignmentRequest request)
    {
        var assignment = await _context.GroupPackageAssignments.FirstOrDefaultAsync(x => x.Id == id);

        if (assignment is null)
            return null;

        var activeFrom = NormalizeDate(request.ActiveFrom);
        var activeTo = NormalizeOptionalDate(request.ActiveTo);

        await ValidateAssignmentRequestAsync(request.GroupId, request.PackageId, activeFrom, activeTo);

        if (request.IsActive)
            await EnsureNoActiveOverlapAsync(request.GroupId, activeFrom, activeTo, id);

        assignment.GroupId = request.GroupId;
        assignment.PackageId = request.PackageId;
        assignment.ActiveFrom = activeFrom;
        assignment.ActiveTo = activeTo;
        assignment.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji rekordu
        assignment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(assignment.Id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var assignment = await _context.GroupPackageAssignments.FirstOrDefaultAsync(x => x.Id == id);

        if (assignment is null)
            return false;

        _context.GroupPackageAssignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return true;
    }

    private static DateTime NormalizeDate(DateTime value)
    {
        // Daty obowiązywania pakietu są zapisywane jako początek dnia w UTC
        return DateTime.SpecifyKind(value.Date, DateTimeKind.Utc);
    }

    private static DateTime? NormalizeOptionalDate(DateTime? value)
    {
        return value.HasValue ? NormalizeDate(value.Value) : null;
    }

    private async Task ValidateAssignmentRequestAsync(Guid groupId, Guid packageId, DateTime activeFrom, DateTime? activeTo)
    {
        // Przypisanie pakietu wymaga istniejącej grupy, aktywnego pakietu oraz poprawnego zakresu dat
        if (groupId == Guid.Empty)
            throw new ArgumentException("GroupId is required");

        if (packageId == Guid.Empty)
            throw new ArgumentException("PackageId is required");

        if (activeFrom == default)
            throw new ArgumentException("ActiveFrom is required");

        if (activeTo.HasValue && activeTo.Value < activeFrom)
            throw new ArgumentException("ActiveTo cannot be earlier than ActiveFrom");

        var group = await _context.Groups
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == groupId);

        if (group is null)
            throw new KeyNotFoundException("Group not found");

        var package = await _context.Packages
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == packageId);

        if (package is null)
            throw new KeyNotFoundException("Package not found");

        if (!package.IsActive)
            throw new InvalidOperationException("Inactive package cannot be assigned to group");

        // Grupa i pakiet muszą należeć do tej samej firmy cateringowej
        if (group.CateringCompanyId != package.CateringCompanyId)
            throw new InvalidOperationException("Group and package must belong to the same catering company");
    }

    private async Task EnsureNoActiveOverlapAsync(Guid groupId, DateTime activeFrom, DateTime? activeTo, Guid? ignoredAssignmentId)
    {
        var requestedActiveTo = activeTo ?? DateTime.MaxValue;

        // Grupa nie może posiadać dwóch aktywnych pakietów w nakładających się okresach
        var overlapExists = await _context.GroupPackageAssignments
            .AnyAsync(x =>
                x.GroupId == groupId &&
                x.IsActive &&
                (!ignoredAssignmentId.HasValue || x.Id != ignoredAssignmentId.Value) &&
                x.ActiveFrom <= requestedActiveTo &&
                (x.ActiveTo == null || x.ActiveTo >= activeFrom));

        if (overlapExists)
            throw new InvalidOperationException("Group already has active package assignment in this period");
    }
}
