namespace Food4Groups.Domain.Entities;

public class Group
{
    public Guid Id { get; set; }
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; } =  DateTime.UtcNow;
    
    public CateringCompany? CateringCompany { get; set; }
}