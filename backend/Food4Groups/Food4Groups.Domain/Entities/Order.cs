using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class Order : BaseEntity
{
    public Guid GroupMemberId { get; set; }
    public Guid MenuDayId { get; set; }
    public Guid DishId { get; set; }
    public Guid OrderStatusId { get; set; }
    
    public GroupMember? GroupMember { get; set; }
    public MenuDay? MenuDay { get; set; }
    public Dish? Dish { get; set; }
    public OrderStatus? OrderStatus { get; set; }
}