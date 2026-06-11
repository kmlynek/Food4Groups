using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class Group : BaseEntity
{
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public int MemberCount { get; set; }
    public CateringCompany? CateringCompany { get; set; }
}