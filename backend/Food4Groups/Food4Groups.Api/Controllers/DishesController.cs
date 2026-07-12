using Food4Groups.Application.DTOs.Dishes;
using Food4Groups.Application.Interfaces.Dishes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DishesController : ControllerBase
{
    private readonly IDishService _dishService;

    public DishesController(IDishService dishService)
    {
        _dishService = dishService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        // Role operacyjne otrzymują pełny katalog, a klienci i koordynatorzy wyłącznie aktywne dania
        var canViewFullCatalog =
            User.IsInRole("Admin") ||
            User.IsInRole("Dietitian") ||
            User.IsInRole("CateringEmployee");

        if (!canViewFullCatalog)
        {
            var activeDishes = await _dishService.GetAllActiveAsync();
            return Ok(activeDishes);
        }

        var allDishes = await _dishService.GetAllAsync();
        return Ok(allDishes);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        // Role operacyjne otrzymują pełne dane, a klienci i koordynatorzy wyłącznie aktywne dania
        var canViewFullCatalog =
            User.IsInRole("Admin") ||
            User.IsInRole("Dietitian") ||
            User.IsInRole("CateringEmployee");

        if (!canViewFullCatalog)
        {
            var activeDish = await _dishService.GetActiveByIdAsync(id);
            return activeDish is null ? NotFound() : Ok(activeDish);
        }

        var dish = await _dishService.GetByIdAsync(id);
        return dish is null ? NotFound() : Ok(dish);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Create([FromBody] CreateDishRequest request)
    {
        try
        {
            var dish = await _dishService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = dish.Id }, dish);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDishRequest request)
    {
        try
        {
            var dish = await _dishService.UpdateAsync(id, request);

            return dish is null ? NotFound() : Ok(dish);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _dishService.DeleteAsync(id);

        return deleted ? NoContent() : NotFound();
    }
}