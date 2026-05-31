namespace Food4Groups.Domain.Entities;

public class GroupPackageAssignment
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public Guid PackageId { get; set; }
    public DateTime ActiveFrom { get; set; }
    public DateTime? ActiveTo { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Group? Group { get; set; }
    public CateringCompany? CateringCompany { get; set; }
}