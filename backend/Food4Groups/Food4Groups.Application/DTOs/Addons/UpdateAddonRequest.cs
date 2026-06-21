namespace Food4Groups.Application.DTOs.Addons;

public class UpdateAddonRequest
{
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } =  true;
}