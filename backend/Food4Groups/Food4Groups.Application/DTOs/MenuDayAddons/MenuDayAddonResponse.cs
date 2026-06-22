namespace Food4Groups.Application.DTOs.MenuDayAddons;

public class MenuDayAddonResponse
{
    public Guid Id { get; set; }
    public Guid MenuDayId { get; set; }
    public DateTime? MenuDate { get; set; }
    public Guid AddonId { get; set; }
    public string? AddonName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}