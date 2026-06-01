namespace Food4Groups.Domain.Entities;

public class SettlementLine
{
    public Guid Id { get; set; }
    public Guid GroupSettlementId { get; set; }
    public Guid OrderId { get; set; }
    public decimal PackagePrice { get; set; }
    public decimal AddonsPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public GroupSettlement? GroupSettlement { get; set; }
    public Order? Order { get; set; }
}