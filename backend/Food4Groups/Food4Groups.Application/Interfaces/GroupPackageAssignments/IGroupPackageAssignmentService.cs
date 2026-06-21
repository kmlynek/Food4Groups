using Food4Groups.Application.DTOs.GroupPackageAssignments;

namespace Food4Groups.Application.Interfaces.GroupPackageAssignments;

public interface IGroupPackageAssignmentService
{
    Task<List<GroupPackageAssignmentResponse>> GetAllAsync();
    Task<List<GroupPackageAssignmentResponse>> GetByGroupIdAsync(Guid groupId);
    Task<GroupPackageAssignmentResponse?> GetByIdAsync(Guid id);
    Task<GroupPackageAssignmentResponse> CreateAsync(CreateGroupPackageAssignmentRequest request);
    Task<GroupPackageAssignmentResponse?> UpdateAsync(Guid id, UpdateGroupPackageAssignmentRequest request);
    Task<bool> DeleteAsync(Guid id);
}