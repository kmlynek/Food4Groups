using Food4Groups.Application.DTOs.MenuPeriods;
using Food4Groups.Application.Interfaces.MenuPeriods;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, CateringEmployee, Dietitian")]
public class MenuPeriodsController : ControllerBase
{
    private readonly IMenuPeriodService _menuPeriodService;

    public MenuPeriodsController(IMenuPeriodService menuPeriodService)
    {
        _menuPeriodService = menuPeriodService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var menuPeriods = await _menuPeriodService.GetAllAsync();

        return Ok(menuPeriods);
    }

    [HttpGet("catering-company/{cateringCompanyId:guid}")]
    public async Task<IActionResult> GetByCateringCompanyId(Guid cateringCompanyId)
    {
        var menuPeriods = await _menuPeriodService.GetByCateringCompanyIdAsync(cateringCompanyId);

        return Ok(menuPeriods);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var menuPeriod = await _menuPeriodService.GetByIdAsync(id);

        return menuPeriod is null ? NotFound() : Ok(menuPeriod);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMenuPeriodRequest request)
    {
        try
        {
            // Kontroler deleguje logikę biznesową do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            var menuPeriod = await _menuPeriodService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = menuPeriod.Id }, menuPeriod);
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMenuPeriodRequest request)
    {
        try
        {
            var menuPeriod = await _menuPeriodService.UpdateAsync(id, request);

            return menuPeriod is null ? NotFound() : Ok(menuPeriod);
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
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _menuPeriodService.DeleteAsync(id);

            return deleted ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }
}