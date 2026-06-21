namespace Food4Groups.Application.DTOs.PackageDishes;

public class UpdatePackageDishRequest
{
    public Guid PackageId { get; set; }
    public Guid DishId { get; set; }
    public bool IsActive { get; set; } = true;
}