namespace Food4Groups.Application.DTOs.Orders;

public class OrderStatusResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public bool IsFinal { get; set; }
    public bool IsActive { get; set; }
}