using Food4Groups.Application.DTOs.Reports;

namespace Food4Groups.Application.Interfaces.Reports;

public interface IReportService
{
    Task<ReportFileResponse> GenerateGroupSettlementProformaPdfAsync(Guid groupId, DateTime dateFrom, DateTime dateTo);
    Task<ReportFileResponse> GenerateDailyOrdersExcelAsync(Guid menuDayId);
}