namespace Food4Groups.Application.DTOs.Dishes;

public class UpdateDishRequest
{
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } =  true;
}