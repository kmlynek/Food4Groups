namespace Food4Groups.Application.DTOs.PackageAddons;

public class PackageAddonResponse
{
    public Guid Id { get; set; }
    public Guid PackageId { get; set; }
    public string? PackageName { get; set; }
    public Guid AddonId { get; set; }
    public string? AddonName { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}