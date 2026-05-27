using Food4Groups.Application.DTOs.GroupMembers;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("[controller]")]
public class GroupMembersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public GroupMembersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Admin, GroupCoordinator, CateringEmployee")]
    public async Task<IActionResult> GetAll()
    {
        var members = await _context.GroupMembers
            .OrderBy(x => x.JoinedAt)
            .ToListAsync();
        
        return Ok(members);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin, GroupCoordinator, CateringEmployee")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var member = await _context.GroupMembers
            .FirstOrDefaultAsync(x=>x.Id == id);
        
        return member == null ? NotFound() : Ok(member);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, GroupCoordinator")]
    public async Task<IActionResult> Create([FromBody] CreateGroupMemberRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
            return BadRequest("UserId is required");
        
        var userId = request.UserId.Trim();

        var groupExists = await _context.Groups.AnyAsync(x => x.Id == request.GroupId);
        if (!groupExists)
            return NotFound("Group not found");

        var userExists = await _context.Users.AnyAsync(x=> x.Id == userId);
        if (!userExists)
            return NotFound("User not found");
        
        var alreadyExists =  await _context.GroupMembers
            .AnyAsync(x=> x.GroupId == request.GroupId && x.UserId == userId);
        
        if (alreadyExists)
            return Conflict("This user already belongs to the selected group");

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
        await RecalculateMemberCountAsync(request.GroupId);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin, GroupCoordinator")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGroupMemberRequest request)
    {
        var member = await _context.GroupMembers.FirstOrDefaultAsync(x => x.Id == id);
        
        if (member is null)
            return NotFound();
        
        if (string.IsNullOrWhiteSpace(request.UserId))
            return BadRequest("UserId is required");
        
        var userId = request.UserId.Trim();
        
        var groupExists = await _context.Groups.AnyAsync((x => x.Id == request.GroupId));
        if(!groupExists)
            return NotFound("Group not found");
        
        var userExists = await _context.Users.AnyAsync(x => x.Id == userId);
        if (!userExists)
            return NotFound("User not found");
        
        var duplicate = await _context.GroupMembers.AnyAsync(x =>
            x.Id != id &&
            x.GroupId == request.GroupId &&
            x.UserId == userId);

        if (duplicate)
            return Conflict("This user already belongs to the selected group");

        var previousGroupId = member.GroupId;

        member.GroupId = request.GroupId;
        member.UserId = userId;
        member.IsActive = request.IsActive;

        await _context.SaveChangesAsync();
        
        await RecalculateMemberCountAsync(previousGroupId);
        if (previousGroupId != request.GroupId)
            await RecalculateMemberCountAsync(request.GroupId);

        await _context.SaveChangesAsync();
        return Ok(member);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin, GroupCoordinator")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var member = await _context.GroupMembers.FirstOrDefaultAsync(x => x.Id == id);
        if (member is null)
            return  NotFound();
        
        var groupId = member.GroupId;
        
        _context.GroupMembers.Remove(member);
        await _context.SaveChangesAsync();
        await RecalculateMemberCountAsync(groupId);
        await  _context.SaveChangesAsync();
        
        return NoContent();
    }

    private async Task RecalculateMemberCountAsync(Guid groupId) // Przelicza liczbę członków w grupie
    {
        var group = await _context.Groups.FirstOrDefaultAsync(x => x.Id == groupId);
        if (group is null)
            return;
        
        group.MemberCount = await _context.GroupMembers
            .CountAsync(x => x.GroupId == groupId);
    }
    
}