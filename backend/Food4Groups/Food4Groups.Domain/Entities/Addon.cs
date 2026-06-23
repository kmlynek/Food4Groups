using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class Addon : BaseEntity
{ 
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    
    public CateringCompany? CateringCompany { get; set; }

}