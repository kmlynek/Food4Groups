using Food4Groups.Application.DTOs.CateringCompanies;
using Food4Groups.Application.Interfaces.CateringCompanies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CateringCompaniesController : ControllerBase
{
    private readonly ICateringCompanyService _cateringCompanyService;

    public CateringCompaniesController(ICateringCompanyService cateringCompanyService)
    {
        _cateringCompanyService = cateringCompanyService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin, CateringEmployee, Dietitian")]
    public async Task<IActionResult> GetAll()
    {
        var companies = await _cateringCompanyService.GetAllAsync();

        return Ok(companies);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin, CateringEmployee, Dietitian")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var company = await _cateringCompanyService.GetByIdAsync(id);

        return company is null ? NotFound() : Ok(company);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateCateringCompanyRequest request)
    {
        try
        {
            // Kontroler deleguje logikę biznesową do serwisu, sam mapuje tylko wynik na odpowiedź HTTP
            var company = await _cateringCompanyService.CreateAsync(request);

            return CreatedAtAction(nameof(GetById), new { id = company.Id }, company);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCateringCompanyRequest request)
    {
        try
        {
            var company = await _cateringCompanyService.UpdateAsync(id, request);

            return company is null ? NotFound() : Ok(company);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _cateringCompanyService.DeleteAsync(id);

            return deleted ? NoContent() : NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }
}