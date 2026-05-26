namespace Food4Groups.Application.DTOs.Addons;

public class CreateAddonRequest
{
    public required string Name { get; set; }
    public string? Description { get; set; }
}