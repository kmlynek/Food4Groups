using Food4Groups.Application.DTOs.Packages;
using Food4Groups.Application.Interfaces.Packages;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, CateringEmployee")]
public class PackagesController : ControllerBase
{
    private readonly IPackageService _packageService;

    public PackagesController(IPackageService packageService)
    {
        _packageService = packageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var packages = await _packageService.GetAllAsync();
        return Ok(packages);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var package = await _packageService.GetByIdAsync(id);
        return package is null ? NotFound() : Ok(package);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePackageRequest request)
    {
        try
        {
            // Kontroler deleguje logikę biznesową do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            var package = await _packageService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = package.Id }, package);
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
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePackageRequest request)
    {
        try
        {
            var package = await _packageService.UpdateAsync(id, request);
            return package is null ? NotFound() : Ok(package);
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
        var deleted = await _packageService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}