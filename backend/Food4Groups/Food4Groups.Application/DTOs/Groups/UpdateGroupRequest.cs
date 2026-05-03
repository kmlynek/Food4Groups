namespace Food4Groups.Application.DTOs.Groups;

public class UpdateGroupRequest
{
    public required string Name { get; set; }
    public int MemberCount { get; set; }
}