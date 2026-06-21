namespace Food4Groups.Application.DTOs.MenuDays;

public class CreateMenuDayRequest
{
    public Guid MenuPeriodId { get; set; }
    public DateTime MenuDate { get; set; }
}