namespace Food4Groups.Application.DTOs.GroupPackageAssignments;

public class CreateGroupPackageAssignmentRequest
{
    public Guid GroupId { get; set; }
    public Guid PackageId { get; set; }
    public DateTime ActiveFrom { get; set; }
    public DateTime? ActiveTo { get; set; }
}