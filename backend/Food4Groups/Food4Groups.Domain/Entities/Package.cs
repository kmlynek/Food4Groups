using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class Package : BaseEntity
{
    public required string Name { get; set; }
    public Guid CateringCompanyId { get; set; }
    public decimal PricePerPerson { get; set; }
    public bool IsActive { get; set; } = true;
    
    public CateringCompany? CateringCompany { get; set; }
}