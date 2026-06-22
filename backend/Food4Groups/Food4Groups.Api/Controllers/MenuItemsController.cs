using Food4Groups.Application.DTOs.MenuItems;
using Food4Groups.Application.Interfaces.MenuItems;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, CateringEmployee, Dietitian")]
public class MenuItemsController : ControllerBase
{
    private readonly IMenuItemService _menuItemService;

    public MenuItemsController(IMenuItemService menuItemService)
    {
        _menuItemService = menuItemService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var menuItems = await _menuItemService.GetAllAsync();

        return Ok(menuItems);
    }

    [HttpGet("menu-day/{menuDayId:guid}")]
    public async Task<IActionResult> GetByMenuDayId(Guid menuDayId)
    {
        var menuItems = await _menuItemService.GetByMenuDayIdAsync(menuDayId);

        return Ok(menuItems);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var menuItem = await _menuItemService.GetByIdAsync(id);

        return menuItem is null ? NotFound() : Ok(menuItem);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMenuItemRequest request)
    {
        try
        {
            // Kontroler deleguje logikę biznesową do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            var menuItem = await _menuItemService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = menuItem.Id }, menuItem);
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMenuItemRequest request)
    {
        try
        {
            var menuItem = await _menuItemService.UpdateAsync(id, request);

            return menuItem is null ? NotFound() : Ok(menuItem);
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
            var deleted = await _menuItemService.DeleteAsync(id);

            return deleted ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }
}