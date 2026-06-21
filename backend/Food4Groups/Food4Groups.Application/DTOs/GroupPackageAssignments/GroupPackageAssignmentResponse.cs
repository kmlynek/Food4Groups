namespace Food4Groups.Application.DTOs.GroupPackageAssignments;

public class GroupPackageAssignmentResponse
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string? GroupName { get; set; }
    public Guid PackageId { get; set; }
    public string? PackageName { get; set; }
    public decimal PackagePricePerPerson { get; set; }
    public DateTime ActiveFrom { get; set; }
    public DateTime? ActiveTo { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}