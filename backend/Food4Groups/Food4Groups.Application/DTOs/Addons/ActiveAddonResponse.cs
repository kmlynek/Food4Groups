namespace Food4Groups.Application.DTOs.Addons;

public class ActiveAddonResponse
{
    public Guid Id { get; set; }  
    public required string Name { get; set; }
    public string? Description { get; set; }
}