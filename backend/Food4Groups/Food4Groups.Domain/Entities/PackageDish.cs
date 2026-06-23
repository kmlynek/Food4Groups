using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class PackageDish : BaseEntity
{
    public Guid PackageId { get; set; }
    public Guid DishId { get; set; }
    public bool IsActive { get; set; } = true;
    
    public Package? Package { get; set; }
    public Dish? Dish { get; set; }
}