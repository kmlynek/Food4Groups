using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class GroupMember : BaseEntity
{
    public Guid GroupId { get; set; }
    public required string UserId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime JoinedAt { get; set; } =  DateTime.UtcNow;
    
    public Group? Group { get; set; }
}