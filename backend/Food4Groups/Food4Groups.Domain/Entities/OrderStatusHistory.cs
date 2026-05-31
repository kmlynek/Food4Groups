namespace Food4Groups.Domain.Entities;

public class OrderStatusHistory
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid OrderStatusId { get; set; }
    public string? ChangedByUserId { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    
    public Order? Order { get; set; }
    public OrderStatus? OrderStatus { get; set; }
}