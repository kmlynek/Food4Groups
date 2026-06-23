using Food4Groups.Application.DTOs.PrintTemplates;

namespace Food4Groups.Application.Interfaces.PrintTemplates;

public interface IPrintTemplateService
{
    Task<List<PrintTemplateResponse>> GetAllAsync();
    Task<PrintTemplateResponse?> GetByCodeAsync(string code);
    Task<PrintTemplateResponse?> UpdateByCodeAsync(string code, UpdatePrintTemplateRequest request);
}