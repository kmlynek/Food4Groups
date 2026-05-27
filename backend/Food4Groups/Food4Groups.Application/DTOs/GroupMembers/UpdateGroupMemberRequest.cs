namespace Food4Groups.Application.DTOs.GroupMembers;

public class UpdateGroupMemberRequest
{
    public Guid GroupId { get; set; }  
    public required string UserId { get; set; }
    public bool IsActive { get; set; } = true;
}