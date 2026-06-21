namespace Food4Groups.Application.DTOs.GroupMembers;

public class GroupMemberResponse
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string? GroupName { get; set; }
    public required string UserId { get; set; }
    public string? UserEmail { get; set; }
    public bool IsActive { get; set; }
    public DateTime JoinedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}