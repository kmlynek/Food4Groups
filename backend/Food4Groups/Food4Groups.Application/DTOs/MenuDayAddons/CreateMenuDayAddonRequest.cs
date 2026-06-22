namespace Food4Groups.Application.DTOs.MenuDayAddons;

public class CreateMenuDayAddonRequest
{
    public Guid MenuDayId { get; set; }
    public Guid AddonId { get; set; }
}