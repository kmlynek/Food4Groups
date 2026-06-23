using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class PrintTemplate : BaseEntity
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public required string TitleTemplate { get; set; }
    public required string BodyTemplate { get; set; }
    public required string FooterTemplate { get; set; }
    public bool IsActive { get; set; } = true;
}