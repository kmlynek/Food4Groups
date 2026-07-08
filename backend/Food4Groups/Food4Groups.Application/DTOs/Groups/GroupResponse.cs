namespace Food4Groups.Application.DTOs.Groups;

public class GroupResponse
{
    public Guid Id { get; set; }
    public Guid CateringCompanyId { get; set; }
    public string? CateringCompanyName { get; set; }
    public string? CoordinatorUserId { get; set; }
    public string? CoordinatorEmail { get; set; }
    public required string Name { get; set; }
    public int MemberCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}