namespace Food4Groups.Domain.Entities;

public class Addon
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; } =  DateTime.UtcNow;
}