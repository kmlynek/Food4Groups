namespace Food4Groups.Domain.Entities;

public class GroupMember
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public required string UserId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime JoinedAt { get; set; } =  DateTime.UtcNow;
    
    public Group? Group { get; set; }
}