using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class MenuDayAddon : BaseEntity
{
    public Guid MenuDayId { get; set; }
    public Guid AddonId { get; set; }
    public bool IsActive { get; set; } = true;
    
    public MenuDay? MenuDay { get; set; }
    public Addon? Addon { get; set; }
}