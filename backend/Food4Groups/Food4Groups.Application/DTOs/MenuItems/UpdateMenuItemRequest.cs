namespace Food4Groups.Application.DTOs.MenuItems;

public class UpdateMenuItemRequest
{
    public Guid MenuDayId { get; set; }
    public Guid DishId { get; set; }
    public bool IsActive { get; set; } = true;

}