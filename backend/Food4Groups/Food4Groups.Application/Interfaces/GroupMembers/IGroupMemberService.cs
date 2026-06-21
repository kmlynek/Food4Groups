using Food4Groups.Application.DTOs.GroupMembers;

namespace Food4Groups.Application.Interfaces.GroupMembers;

public interface IGroupMemberService
{
    Task<List<GroupMemberResponse>> GetAllAsync();
    Task<List<AvailableGroupMemberResponse>> GetAvailableUsersAsync();
    Task<GroupMemberResponse?> GetByIdAsync(Guid id);
    Task<GroupMemberResponse> CreateAsync(CreateGroupMemberRequest request);
    Task<GroupMemberResponse?> UpdateAsync(Guid id, UpdateGroupMemberRequest request);
    Task<bool> DeleteAsync(Guid id);
}