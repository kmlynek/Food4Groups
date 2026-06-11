using Food4Groups.Application.DTOs.Groups;

namespace Food4Groups.Application.Interfaces.Groups;

public interface IGroupService
{
    Task<List<GroupResponse>> GetAllAsync();
    Task<GroupResponse?> GetByIdAsync(Guid id);
    Task<GroupResponse> CreateAsync(CreateGroupRequest request);
    Task<GroupResponse?> UpdateAsync(Guid id, UpdateGroupRequest request);
    Task<bool> DeleteAsync(Guid id);
}