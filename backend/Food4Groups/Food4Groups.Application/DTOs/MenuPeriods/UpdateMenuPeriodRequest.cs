namespace Food4Groups.Application.DTOs.MenuPeriods;

public class UpdateMenuPeriodRequest
{
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}