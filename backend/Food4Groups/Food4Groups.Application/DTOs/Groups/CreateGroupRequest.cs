namespace Food4Groups.Application.DTOs.Groups;

public class CreateGroupRequest
{
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public int MemberCount { get; set; }
}