namespace Food4Groups.Application.DTOs.MenuItems;

public class MenuItemResponse
{
    public Guid Id { get; set; }
    public Guid MenuDayId { get; set; }
    public DateTime? MenuDate { get; set; }
    public Guid DishId { get; set; }
    public string? DishName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}