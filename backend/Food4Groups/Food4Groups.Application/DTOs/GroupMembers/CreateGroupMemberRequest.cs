namespace Food4Groups.Application.DTOs.GroupMembers;

public class CreateGroupMemberRequest
{
    public Guid GroupId { get; set; }
    public required string UserId { get; set; }
}