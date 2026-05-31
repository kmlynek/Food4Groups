namespace Food4Groups.Domain.Entities;

public class Package
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public Guid CateringCompanyId { get; set; }
    public decimal PricePerPerson { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime Created { get; set; }
    
    public CateringCompany? CateringCompany { get; set; }
}