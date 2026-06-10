namespace Food4Groups.Application.DTOs.Dishes;

public class ActiveDishResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
}