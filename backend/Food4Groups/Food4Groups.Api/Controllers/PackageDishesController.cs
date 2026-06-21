using Food4Groups.Application.DTOs.PackageDishes;
using Food4Groups.Application.Interfaces.PackageDishes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, Dietitian")]
public class PackageDishesController : ControllerBase
{
    private readonly IPackageDishService _packageDishService;

    public PackageDishesController(IPackageDishService packageDishService)
    {
        _packageDishService = packageDishService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var packageDishes = await _packageDishService.GetAllAsync();

        return Ok(packageDishes);
    }

    [HttpGet("package/{packageId:guid}")]
    public async Task<IActionResult> GetByPackageId(Guid packageId)
    {
        var packageDishes = await _packageDishService.GetByPackageIdAsync(packageId);

        return Ok(packageDishes);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var packageDish = await _packageDishService.GetByIdAsync(id);

        return packageDish is null ? NotFound() : Ok(packageDish);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePackageDishRequest request)
    {
        try
        {
            // Kontroler deleguje logikę biznesową do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            var packageDish = await _packageDishService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = packageDish.Id }, packageDish);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePackageDishRequest request)
    {
        try
        {
            var packageDish = await _packageDishService.UpdateAsync(id, request);

            return packageDish is null ? NotFound() : Ok(packageDish);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _packageDishService.DeleteAsync(id);

        return deleted ? NoContent() : NotFound();
    }
}
