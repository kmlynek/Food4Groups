namespace Food4Groups.Application.DTOs.Addons;

public class CreateAddonRequest
{
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
}