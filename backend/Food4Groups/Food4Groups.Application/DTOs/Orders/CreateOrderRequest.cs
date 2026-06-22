namespace Food4Groups.Application.DTOs.Orders;

public class CreateOrderRequest
{
    public Guid GroupMemberId { get; set; }
    public Guid MenuDayId { get; set; }
    public Guid DishId { get; set; }
    public List<Guid> AddonIds { get; set; } = [];
}