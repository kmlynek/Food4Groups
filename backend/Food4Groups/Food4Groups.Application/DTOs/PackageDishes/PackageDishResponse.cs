namespace Food4Groups.Application.DTOs.PackageDishes;

public class PackageDishResponse
{
    public Guid Id { get; set; }
    public Guid PackageId { get; set; }
    public string? PackageName { get; set; }
    public Guid DishId { get; set; }
    public string? DishName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}