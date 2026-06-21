namespace Food4Groups.Application.DTOs.PackageDishes;

public class CreatePackageDishRequest
{
    public Guid PackageId { get; set; }
    public Guid DishId { get; set; }
}