namespace Food4Groups.Domain.Entities;

public class MenuPeriod
{
    public Guid Id { get; set; }
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public CateringCompany? CateringCompany { get; set; }
}