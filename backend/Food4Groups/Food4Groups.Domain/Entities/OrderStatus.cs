namespace Food4Groups.Domain.Entities;

public class OrderStatus
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public bool IsFinal { get; set; } = false;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}