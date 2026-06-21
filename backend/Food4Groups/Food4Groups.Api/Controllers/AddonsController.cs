using Food4Groups.Application.DTOs.Addons;
using Food4Groups.Application.Interfaces.Addons;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AddonsController : ControllerBase
{
    private readonly IAddonService _addonService;

    public AddonsController(IAddonService addonService)
    {
        _addonService = addonService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll()
    {
        // Klienci oraz koordynatorzy grup otrzymują wyłącznie aktywne dodatki
        if (User.IsInRole("User") || User.IsInRole("GroupCoordinator"))
        {
            var activeAddons = await _addonService.GetAllActiveAsync();
            return Ok(activeAddons);
        }

        var allAddons = await _addonService.GetAllAsync();
        return Ok(allAddons);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        // Dostęp do szczegółów dla użytkowników końcowych ograniczony jest do aktywnych dodatków
        if (User.IsInRole("User") || User.IsInRole("GroupCoordinator"))
        {
            var activeAddon = await _addonService.GetActiveByIdAsync(id);
            return activeAddon is null ? NotFound() : Ok(activeAddon);
        }

        var addon = await _addonService.GetByIdAsync(id);
        return addon is null ? NotFound() : Ok(addon);
    }

    [HttpPost]
    [Authorize(Roles = "Admin, Dietitian")]
    public async Task<IActionResult> Create([FromBody] CreateAddonRequest request)
    {
        try
        {
            var addon = await _addonService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = addon.Id }, addon);
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAddonRequest request)
    {
        try
        {
            var addon = await _addonService.UpdateAsync(id, request);

            return addon is null ? NotFound() : Ok(addon);
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
        var deleted = await _addonService.DeleteAsync(id);

        return deleted ? NoContent() : NotFound();
    }
}