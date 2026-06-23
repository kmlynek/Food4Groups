using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class MenuDay : BaseEntity
{
    public Guid MenuPeriodId { get; set; }
    public DateTime MenuDate { get; set; }
    public bool IsActive { get; set; } = true;
    
    public MenuPeriod? MenuPeriod { get; set; }
}