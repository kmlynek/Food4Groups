using Food4Groups.Application.DTOs.CateringCompanies;

namespace Food4Groups.Application.Interfaces.CateringCompanies;

public interface ICateringCompanyService
{
    Task<List<CateringCompanyResponse>> GetAllAsync();
    Task<CateringCompanyResponse?> GetByIdAsync(Guid id);
    Task<CateringCompanyResponse> CreateAsync(CreateCateringCompanyRequest request);
    Task<CateringCompanyResponse?> UpdateAsync(Guid id, UpdateCateringCompanyRequest request);
    Task<bool> DeleteAsync(Guid id);
}