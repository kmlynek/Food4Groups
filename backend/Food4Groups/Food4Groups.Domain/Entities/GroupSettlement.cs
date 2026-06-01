namespace Food4Groups.Domain.Entities;

public class GroupSettlement
{
    public Guid Id { get; set; }
    public Guid SettlementPeriodId { get; set; }
    public Guid GroupId { get; set; }
    public int OrdersCount { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public SettlementPeriod? SettlementPeriod { get; set; }
    public Group? Group { get; set; }
}