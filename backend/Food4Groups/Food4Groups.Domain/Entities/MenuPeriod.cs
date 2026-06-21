using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class MenuPeriod : BaseEntity
{
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    
    public CateringCompany? CateringCompany { get; set; }
}