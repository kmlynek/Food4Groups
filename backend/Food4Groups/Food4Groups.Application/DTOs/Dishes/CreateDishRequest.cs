namespace Food4Groups.Application.DTOs.Dishes;

public class CreateDishRequest
{
    public Guid CateringCompanyId { get; set; }
    public required string  Name { get; set; }
    public string? Description { get; set; }
}