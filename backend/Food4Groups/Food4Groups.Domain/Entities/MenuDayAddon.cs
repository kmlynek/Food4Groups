namespace Food4Groups.Domain.Entities;

public class MenuDayAddon
{
    public Guid Id { get; set; }
    public Guid MenuDayId { get; set; }
    public Guid AddonId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public MenuDay? MenuDay { get; set; }
    public Addon? Addon { get; set; }
}