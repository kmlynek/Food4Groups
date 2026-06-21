namespace Food4Groups.Application.DTOs.MenuPeriods;

public class MenuPeriodResponse
{
    public Guid Id { get; set; }
    public Guid CateringCompanyId { get; set; }
    public string? CateringCompanyName { get; set; }
    public required string Name { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}