namespace Food4Groups.Application.DTOs.MenuDays;

public class MenuDayResponse
{
    public Guid Id { get; set; }
    public Guid MenuPeriodId { get; set; }
    public string? MenuPeriodName { get; set; }
    public Guid CateringCompanyId { get; set; }
    public string? CateringCompanyName { get; set; }
    public DateTime MenuDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}