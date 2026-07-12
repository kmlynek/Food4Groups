using Food4Groups.Application.DTOs.PrintTemplates;
using Food4Groups.Application.Interfaces.PrintTemplates;
using Food4Groups.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Food4Groups.Infrastructure.Services.PrintTemplates;

public class PrintTemplateService : IPrintTemplateService
{
    private readonly ApplicationDbContext _context;

    public PrintTemplateService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PrintTemplateResponse>> GetAllAsync()
    {
        // Szablony pozwalają modyfikować zawartość generowanych dokumentów bez zmiany kodu aplikacji
        return await _context.PrintTemplates
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new PrintTemplateResponse
            {
                Id = x.Id,
                Code = x.Code,
                Name = x.Name,
                TitleTemplate = x.TitleTemplate,
                BodyTemplate = x.BodyTemplate,
                FooterTemplate = x.FooterTemplate,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .ToListAsync();
    }

    public async Task<PrintTemplateResponse?> GetByCodeAsync(string code)
    {
        return await _context.PrintTemplates
            .AsNoTracking()
            .Where(x => x.Code == code)
            .Select(x => new PrintTemplateResponse
            {
                Id = x.Id,
                Code = x.Code,
                Name = x.Name,
                TitleTemplate = x.TitleTemplate,
                BodyTemplate = x.BodyTemplate,
                FooterTemplate = x.FooterTemplate,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<PrintTemplateResponse?> UpdateByCodeAsync(string code, UpdatePrintTemplateRequest request)
    {
        var template = await _context.PrintTemplates.FirstOrDefaultAsync(x => x.Code == code);

        if (template is null)
            return null;

        ValidateRequest(request);

        template.Name = request.Name.Trim();
        template.TitleTemplate = request.TitleTemplate.Trim();
        template.BodyTemplate = request.BodyTemplate.Trim();
        template.FooterTemplate = request.FooterTemplate.Trim();
        template.IsActive = request.IsActive;

        // Data aktualizacji pozwala śledzić moment ostatniej modyfikacji szablonu
        template.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByCodeAsync(code);
    }

    private static void ValidateRequest(UpdatePrintTemplateRequest request)
    {
        // Każdy szablon musi zawierać komplet sekcji wymaganych do wygenerowania dokumentu
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ArgumentException("Podaj nazwę szablonu");

        if (string.IsNullOrWhiteSpace(request.TitleTemplate))
            throw new ArgumentException("Podaj tytuł dokumentu");

        if (string.IsNullOrWhiteSpace(request.BodyTemplate))
            throw new ArgumentException("Podaj treść dokumentu");

        if (string.IsNullOrWhiteSpace(request.FooterTemplate))
            throw new ArgumentException("Podaj stopkę dokumentu");
    }
}
