namespace Food4Groups.Application.DTOs.Orders;

public class OrderResponse
{
    public Guid Id { get; set; }
    public Guid GroupMemberId { get; set; }
    public string? CustomerEmail { get; set; }
    public Guid GroupId { get; set; }
    public string? GroupName { get; set; }
    public Guid MenuDayId { get; set; }
    public DateTime? MenuDate { get; set; }
    public Guid DishId { get; set; }
    public string? DishName { get; set; }
    public Guid OrderStatusId { get; set; }
    public string? OrderStatusName { get; set; }
    public List<OrderAddonResponse> Addons { get; set; } = [];
    public List<OrderStatusHistoryResponse> StatusHistory { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}