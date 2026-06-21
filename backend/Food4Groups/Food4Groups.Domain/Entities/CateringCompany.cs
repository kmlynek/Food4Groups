using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class CateringCompany : BaseEntity
{ 
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
}