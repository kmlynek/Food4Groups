namespace Food4Groups.Domain.Entities;

public class Order
{
    public Guid Id { get; set; }
    public Guid GroupMemberId { get; set; }
    public Guid MenuDayId { get; set; }
    public Guid DishId { get; set; }
    public Guid OrderStatusId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public GroupMember? GroupMember { get; set; }
    public MenuDay? MenuDay { get; set; }
    public Dish? Dish { get; set; }
    public OrderStatus? OrderStatus { get; set; }
}