using Food4Groups.Application.Interfaces.Reports;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin, CateringEmployee")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("group-settlement-proforma")]
    public async Task<IActionResult> GetGroupSettlementProformaPdf(
        [FromQuery] Guid groupId,
        [FromQuery] DateTime dateFrom,
        [FromQuery] DateTime dateTo)
    {
        try
        {
            // Raport proforma jest parametryzowany grupą oraz zakresem dat
            var report = await _reportService.GenerateGroupSettlementProformaPdfAsync(groupId, dateFrom, dateTo);

            return File(report.Content, report.ContentType, report.FileName);
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

    [HttpGet("daily-orders")]
    public async Task<IActionResult> GetDailyOrdersExcel([FromQuery] Guid menuDayId)
    {
        try
        {
            // Raport dzienny jest plikiem operacyjnym dla pracownika cateringu
            var report = await _reportService.GenerateDailyOrdersExcelAsync(menuDayId);

            return File(report.Content, report.ContentType, report.FileName);
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
}