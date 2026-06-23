namespace Food4Groups.Application.DTOs.Reports;

public class ReportFileResponse
{
    public required string FileName { get; set; }
    public required string ContentType { get; set; }
    public required byte[] Content { get; set; }
}