using Food4Groups.Application.DTOs.MenuDayAddons;
using Food4Groups.Application.Interfaces.MenuDayAddons;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, CateringEmployee, Dietitian")]
public class MenuDayAddonsController : ControllerBase
{
    private readonly IMenuDayAddonService _menuDayAddonService;

    public MenuDayAddonsController(IMenuDayAddonService menuDayAddonService)
    {
        _menuDayAddonService = menuDayAddonService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var menuDayAddons = await _menuDayAddonService.GetAllAsync();

        return Ok(menuDayAddons);
    }

    [HttpGet("menu-day/{menuDayId:guid}")]
    public async Task<IActionResult> GetByMenuDayId(Guid menuDayId)
    {
        var menuDayAddons = await _menuDayAddonService.GetByMenuDayIdAsync(menuDayId);

        return Ok(menuDayAddons);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var menuDayAddon = await _menuDayAddonService.GetByIdAsync(id);

        return menuDayAddon is null ? NotFound() : Ok(menuDayAddon);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMenuDayAddonRequest request)
    {
        try
        {
            // Kontroler deleguje logikę biznesową do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            var menuDayAddon = await _menuDayAddonService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = menuDayAddon.Id }, menuDayAddon);
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMenuDayAddonRequest request)
    {
        try
        {
            var menuDayAddon = await _menuDayAddonService.UpdateAsync(id, request);

            return menuDayAddon is null ? NotFound() : Ok(menuDayAddon);
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
        try
        {
            var deleted = await _menuDayAddonService.DeleteAsync(id);

            return deleted ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }
}