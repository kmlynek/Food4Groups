using Food4Groups.Application.DTOs.PrintTemplates;
using Food4Groups.Application.Interfaces.PrintTemplates;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, CateringEmployee")]
public class PrintTemplatesController : ControllerBase
{
    private readonly IPrintTemplateService _printTemplateService;

    public PrintTemplatesController(IPrintTemplateService printTemplateService)
    {
        _printTemplateService = printTemplateService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var templates = await _printTemplateService.GetAllAsync();

        return Ok(templates);
    }

    [HttpGet("{code}")]
    public async Task<IActionResult> GetByCode(string code)
    {
        var template = await _printTemplateService.GetByCodeAsync(code);

        return template is null ? NotFound() : Ok(template);
    }

    [HttpPut("{code}")]
    public async Task<IActionResult> UpdateByCode(string code, [FromBody] UpdatePrintTemplateRequest request)
    {
        try
        {
            // Edycja szablonu pozwala zmienić treść wydruku bez zmiany kodu raportu
            var template = await _printTemplateService.UpdateByCodeAsync(code, request);

            return template is null ? NotFound() : Ok(template);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
    }
}