using Food4Groups.Application.DTOs.PackageAddons;
using Food4Groups.Application.Interfaces.PackageAddons;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, Dietitian")]
public class PackageAddonsController : ControllerBase
{
    private readonly IPackageAddonService _packageAddonService;

    public PackageAddonsController(IPackageAddonService packageAddonService)
    {
        _packageAddonService = packageAddonService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var packageAddons = await _packageAddonService.GetAllAsync();

        return Ok(packageAddons);
    }

    [HttpGet("package/{packageId:guid}")]
    public async Task<IActionResult> GetByPackageId(Guid packageId)
    {
        var packageAddons = await _packageAddonService.GetByPackageIdAsync(packageId);

        return Ok(packageAddons);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var packageAddon = await _packageAddonService.GetByIdAsync(id);

        return packageAddon is null ? NotFound() : Ok(packageAddon);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePackageAddonRequest request)
    {
        try
        {
            // Kontroler deleguje logikę biznesową do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            var packageAddon = await _packageAddonService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = packageAddon.Id }, packageAddon);
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePackageAddonRequest request)
    {
        try
        {
            var packageAddon = await _packageAddonService.UpdateAsync(id, request);

            return packageAddon is null ? NotFound() : Ok(packageAddon);
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
        var deleted = await _packageAddonService.DeleteAsync(id);

        return deleted ? NoContent() : NotFound();
    }
}
