namespace Food4Groups.Application.DTOs.Packages;

public class PackageResponse
{
    public Guid Id { get; set; }
    public Guid CateringCompanyId { get; set; }
    public string? CateringCompanyName { get; set; }
    public required string Name { get; set; }
    public decimal PricePerPerson { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}