namespace Food4Groups.Application.DTOs.MenuDays;

public class UpdateMenuDayRequest
{
    public Guid MenuPeriodId { get; set; }
    public DateTime MenuDate { get; set; }
    public bool IsActive { get; set; } = true;
}