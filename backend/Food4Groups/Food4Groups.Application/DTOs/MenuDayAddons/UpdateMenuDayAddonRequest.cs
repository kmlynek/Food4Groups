namespace Food4Groups.Application.DTOs.MenuDayAddons;

public class UpdateMenuDayAddonRequest
{
    public Guid MenuDayId { get; set; }
    public Guid AddonId { get; set; }
    public bool IsActive { get; set; } = true;
}