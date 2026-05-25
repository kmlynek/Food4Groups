using Food4Groups.Application.DTOs.Dishes;
using Food4Groups.Domain.Entities;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DishesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DishesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        if (User.IsInRole("User") || User.IsInRole("GroupCoordinator"))
        {
            var activeDishes = await _context.Dishes
                .Where(x => x.IsActive)
                .OrderBy(x => x.Name)
                .ToListAsync();

            return Ok(activeDishes);
        }
        var allDishes = await _context.Dishes
            .OrderBy(x => x.Name)
            .ToListAsync();

        return Ok(allDishes);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        if (User.IsInRole("User") || User.IsInRole("GroupCoordinator"))
        {
            var activeDish = await _context.Dishes
                .FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
    
            return activeDish is null ? NotFound() : Ok(activeDish);
        }
        
        var dish = await _context.Dishes.FirstOrDefaultAsync(x => x.Id == id);
        if (dish is null)
        {
            return NotFound();
        }

        return Ok(dish);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Create([FromBody] CreateDishRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name is required");

        // object initializer
        var dish = new Dish
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        
        _context.Dishes.Add(dish);
        await _context.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetById), new { id = dish.Id }, dish);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDishRequest request)
    {
        var dish = await _context.Dishes.FirstOrDefaultAsync(x => x.Id == id);
        if (dish is null) return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Name is required");
        
        dish.Name = request.Name.Trim();
        dish.Description = request.Description?.Trim();
        dish.IsActive = request.IsActive;
        
        await _context.SaveChangesAsync();
        return Ok(dish);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var dish = await _context.Dishes.FirstOrDefaultAsync(x => x.Id == id);
        if (dish is null) return NotFound();
        
        _context.Dishes.Remove(dish);
        
        await _context.SaveChangesAsync();
        return NoContent();
    }

}