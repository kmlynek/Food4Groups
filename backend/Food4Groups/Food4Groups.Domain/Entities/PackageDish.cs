namespace Food4Groups.Domain.Entities;

public class PackageDish
{
    public Guid Id { get; set; }
    public Guid PackageId { get; set; }
    public Guid DishId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Package? Package { get; set; }
    public Dish? Dish { get; set; }
}