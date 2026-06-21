namespace Food4Groups.Application.DTOs.CateringCompanies;

public class UpdateCateringCompanyRequest
{
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
}