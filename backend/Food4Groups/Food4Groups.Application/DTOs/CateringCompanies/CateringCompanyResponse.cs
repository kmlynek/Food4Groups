namespace Food4Groups.Application.DTOs.CateringCompanies;

public class CateringCompanyResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}