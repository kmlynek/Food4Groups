using Food4Groups.Application.DTOs.MenuDays;
using Food4Groups.Application.Interfaces.MenuDays;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, CateringEmployee, Dietitian")]
public class MenuDaysController : ControllerBase
{
    private readonly IMenuDayService _menuDayService;

    public MenuDaysController(IMenuDayService menuDayService)
    {
        _menuDayService = menuDayService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var menuDays = await _menuDayService.GetAllAsync();

        return Ok(menuDays);
    }

    [HttpGet("menu-period/{menuPeriodId:guid}")]
    public async Task<IActionResult> GetByMenuPeriodId(Guid menuPeriodId)
    {
        var menuDays = await _menuDayService.GetByMenuPeriodIdAsync(menuPeriodId);

        return Ok(menuDays);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var menuDay = await _menuDayService.GetByIdAsync(id);

        return menuDay is null ? NotFound() : Ok(menuDay);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMenuDayRequest request)
    {
        try
        {
            // Kontroler deleguje logikę biznesową do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            var menuDay = await _menuDayService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = menuDay.Id }, menuDay);
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMenuDayRequest request)
    {
        try
        {
            var menuDay = await _menuDayService.UpdateAsync(id, request);

            return menuDay is null ? NotFound() : Ok(menuDay);
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
            var deleted = await _menuDayService.DeleteAsync(id);

            return deleted ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }
}