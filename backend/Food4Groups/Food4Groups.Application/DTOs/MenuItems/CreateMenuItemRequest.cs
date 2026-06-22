namespace Food4Groups.Application.DTOs.MenuItems;

public class CreateMenuItemRequest
{
    public Guid MenuDayId { get; set; }
    public Guid DishId { get; set; }
}