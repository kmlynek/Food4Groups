namespace Food4Groups.Application.DTOs.Groups;

public class UpdateGroupRequest
{
    public Guid CateringCompanyId { get; set; }
    public required string Name { get; set; }
    public string? CoordinatorUserId { get; set; }
}