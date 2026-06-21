using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class PackageAddon : BaseEntity
{
    public Guid PackageId { get; set; }
    public Guid AddonId { get; set; }
    public bool IsActive { get; set; } = true;
    
    public Package? Package { get; set; }
    public Addon? Addon { get; set; }
    
}