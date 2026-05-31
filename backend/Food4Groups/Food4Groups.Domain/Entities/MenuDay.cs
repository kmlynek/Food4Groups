namespace Food4Groups.Domain.Entities;

public class MenuDay
{
    public Guid Id { get; set; }
    public Guid MenuPeriodId { get; set; }
    public DateTime MenuDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public MenuPeriod? MenuPeriod { get; set; }
}