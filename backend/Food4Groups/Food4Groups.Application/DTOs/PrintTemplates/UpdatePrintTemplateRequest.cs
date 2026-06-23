namespace Food4Groups.Application.DTOs.PrintTemplates;

public class UpdatePrintTemplateRequest
{
    public required string Name { get; set; }
    public required string TitleTemplate { get; set; }
    public required string BodyTemplate { get; set; }
    public required string FooterTemplate { get; set; }
    public bool IsActive { get; set; } = true;
}