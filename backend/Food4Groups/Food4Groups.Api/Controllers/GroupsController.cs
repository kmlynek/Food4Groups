using Food4Groups.Application.DTOs.Groups;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]

public class GroupsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public GroupsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        var groups = await _context.Groups
            .OrderBy(x => x.Name)
            .ToListAsync();
        
        return Ok(groups);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var group = await _context.Groups.FirstOrDefaultAsync(x=>x.Id == id);
        if (group is null)
        {
            return NotFound();
        }
        return Ok(group);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, GroupCoordinator")]
    public async Task<IActionResult> Create([FromBody] CreateGroupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name is required");

        if (request.MemberCount < 0)
            return BadRequest("Member count cannot be negative");

        var group = new Group
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            MemberCount = request.MemberCount,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Groups.Add(group);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetById), new { id = group.Id }, group);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin, GroupCoordinator")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGroupRequest request)
    {
        var group = await _context.Groups.FirstOrDefaultAsync(x=>x.Id == id);
        if (group is null)
            return NotFound();
        
        if (string.IsNullOrWhiteSpace((request.Name)))
            return BadRequest("Name is required");
        
        if (request.MemberCount < 0)
            return BadRequest("Member count cannot be negative");
        
        group.Name = request.Name.Trim();
        group.MemberCount = request.MemberCount;
        
        await _context.SaveChangesAsync();
        return Ok(group);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var group = await _context.Groups.FirstOrDefaultAsync(x=>x.Id == id);
        if (group is null)
            return NotFound();
        
        _context.Groups.Remove(group);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}


