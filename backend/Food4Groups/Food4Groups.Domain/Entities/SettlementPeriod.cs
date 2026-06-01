namespace Food4Groups.Domain.Entities;

public class SettlementPeriod
{
    public Guid Id { get; set; }
    public Guid? CateringPeriodId { get; set; }
    public required string Name { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsClosed { get; set; } = false;
    public DateTime CreatedAt { get; set; } =  DateTime.UtcNow;
    
    public CateringCompany?  CateringCompany { get; set; }
}