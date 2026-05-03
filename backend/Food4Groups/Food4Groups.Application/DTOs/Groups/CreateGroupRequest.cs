namespace Food4Groups.Application.DTOs.Groups;

public class CreateGroupRequest
{
    public required string Name { get; set; }
    public int MemberCount { get; set; }
}