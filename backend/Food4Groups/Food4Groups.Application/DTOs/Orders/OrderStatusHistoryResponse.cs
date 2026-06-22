namespace Food4Groups.Application.DTOs.Orders;

public class OrderStatusHistoryResponse
{
    public Guid OrderStatusId { get; set; }
    public string? OrderStatusName { get; set; }
    public string? ChangedByUserId { get; set; }
    public DateTime ChangedAt { get; set; }
}