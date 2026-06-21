namespace Food4Groups.Application.DTOs.Packages;

public class UpdatePackageRequest
{
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public decimal PricePerPerson { get; set; }
    public bool IsActive { get; set; } = true;
}