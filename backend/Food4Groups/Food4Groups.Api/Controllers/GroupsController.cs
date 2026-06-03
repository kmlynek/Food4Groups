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
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> GetAll()
    {
        // Lista wszystkich grup jest dostępna dla administratora oraz pracownika obsługującego grupy 
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
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> Create([FromBody] CreateGroupRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name is required");
        
        // Liczba członków grupy nie może być ujemna - reprezentuje rzeczywistą liczbę przypisanych do grupy osób
        if (request.MemberCount < 0)
            return BadRequest("Member count cannot be negative");

        if (request.CateringCompanyId == Guid.Empty)
            return BadRequest("CateringCompanyId is required");

        // Grupa musi być powiązana z istniejącą firmą cateringową - zapobiega utwrozenia rekordu z niepoprawnym FK
        var cateringCompanyExists = await _context.CateringCompanies
            .AnyAsync(x => x.Id == request.CateringCompanyId);

        if (!cateringCompanyExists)
            return NotFound("Catering company not found");

        var group = new Group
        {
            Id = Guid.NewGuid(),
            CateringCompanyId = request.CateringCompanyId,
            Name = request.Name.Trim(),
            MemberCount = request.MemberCount,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Groups.Add(group);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetById), new { id = group.Id }, group);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> Update (Guid id, [FromBody] UpdateGroupRequest request)
    {
        var group = await _context.Groups.FirstOrDefaultAsync(x=>x.Id == id);
        if (group is null)
            return NotFound();
        
        if (string.IsNullOrWhiteSpace((request.Name)))
            return BadRequest("Name is required");
        
        if (request.MemberCount < 0)
            return BadRequest("Member count cannot be negative");

        if (request.CateringCompanyId == Guid.Empty)
            return BadRequest("CateringCompanyId is required");

        // Przy aktualizacji również weryfikowane jest istnienie firmy cateringowej
        var cateringCompanyExists = await _context.CateringCompanies
            .AnyAsync(x => x.Id == request.CateringCompanyId);

        if (!cateringCompanyExists)
            return NotFound("Catering company not found");
        
        group.CateringCompanyId = request.CateringCompanyId;
        group.Name = request.Name.Trim();
        group.MemberCount = request.MemberCount;
        
        await _context.SaveChangesAsync();
        return Ok(group);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin, CateringEmployee")]
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


