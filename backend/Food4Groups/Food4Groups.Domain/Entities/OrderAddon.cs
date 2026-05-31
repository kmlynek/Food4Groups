namespace Food4Groups.Domain.Entities;

public class OrderAddon
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid AddonId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Order? Order { get; set; }
    public Addon? Addon { get; set; }
}