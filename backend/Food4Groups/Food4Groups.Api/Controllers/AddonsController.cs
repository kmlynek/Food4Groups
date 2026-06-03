using Food4Groups.Application.DTOs.Addons;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AddonsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    
    public AddonsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        // Użytkownicy końcowi oraz koordynatorzy grup mogą przeglądać wyłącznie aktywne dodatki
        if (User.IsInRole("User") || User.IsInRole("GroupCoordinator"))
        {
            var activeAddons = await _context.Addons
                .Where(x => x.IsActive)
                .OrderBy(x => x.Name)
                .ToListAsync();
            
            return Ok(activeAddons);
        }
        
        var allAddons = await _context.Addons
            .OrderBy(x => x.Name)
            .ToListAsync();
        
        return Ok(allAddons);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        // Dostęp do szczegółów dodatku dla użytkowników końcowych ograniczony jest wyłącznie do aktywnych pozycji
        if (User.IsInRole("User") || User.IsInRole("GroupCoordinator"))
        {
            var activeAddon = await _context.Addons
                .FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
            
            return activeAddon is null ? NotFound() : Ok(activeAddon);
        }
        
        var addon = await _context.Addons
            .FirstOrDefaultAsync(x=>x.Id == id);
        
        return addon is null ? NotFound() : Ok(addon);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Create([FromBody] CreateAddonRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name is required");

        // Nowo utworzony dodatek jest domyślnie oznaczany jako aktywny
        var addon = new Addon()
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Addons.Add(addon);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetById), new { id = addon.Id }, addon);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAddonRequest request)
    {
        var addon = await _context.Addons
            .FirstOrDefaultAsync(x=>x.Id == id);

        if (addon is null)
            return NotFound();
        
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name is required");

        addon.Name = request.Name.Trim();
        addon.Description = request.Description?.Trim();
        // Status aktywności pozwala ukryć dodatek przed użytkownikami bez konieczności usuwania go z bazy danych
        addon.IsActive = request.IsActive;
        
        await _context.SaveChangesAsync();
        return Ok(addon);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var addon = await _context.Addons.FirstOrDefaultAsync(x=>x.Id == id);

        if (addon is null)
            return NotFound();
        
        _context.Addons.Remove(addon);
        
        await _context.SaveChangesAsync();
        return NoContent();
    }
}