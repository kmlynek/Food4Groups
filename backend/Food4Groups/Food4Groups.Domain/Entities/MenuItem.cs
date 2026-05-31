namespace Food4Groups.Domain.Entities;

public class MenuItem
{
    public Guid Id { get; set; }
    public Guid MenuDayId { get; set; }
    public Guid DishId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; } =  DateTime.Now;
    
    public MenuDay? MenuDay { get; set; }
    public Dish? Dish { get; set; }
}