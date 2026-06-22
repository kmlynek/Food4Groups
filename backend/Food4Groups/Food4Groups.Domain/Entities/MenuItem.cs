using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class MenuItem : BaseEntity
{
    public Guid MenuDayId { get; set; }
    public Guid DishId { get; set; }
    public bool IsActive { get; set; } =  true;
    
    public MenuDay? MenuDay { get; set; }
    public Dish? Dish { get; set; }
}