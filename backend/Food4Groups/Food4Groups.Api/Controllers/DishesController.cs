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
        // Użytkownicy końcowi oraz koordynatorzy grup otrzymują wyłącznie aktywne dania
        if (User.IsInRole("User") || User.IsInRole("GroupCoordinator"))
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
        // Dostęp do szczegółów dla użytkowników końcowych ograniczony jest do aktywnych dań
        if (User.IsInRole("User") || User.IsInRole("GroupCoordinator"))
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
            // Kontroler odpowiada za obsługę żądania HTTP, a logika biznesowa została wydzielona do serwisu
            var dish = await _dishService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = dish.Id }, dish);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
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
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _dishService.DeleteAsync(id);

        return deleted ? NoContent() : NotFound();
    }
}