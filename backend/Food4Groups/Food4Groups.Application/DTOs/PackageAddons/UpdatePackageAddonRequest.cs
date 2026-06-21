namespace Food4Groups.Application.DTOs.PackageAddons;

public class UpdatePackageAddonRequest
{
    public Guid PackageId { get; set; }
    public Guid AddonId { get; set; }
    public bool IsActive { get; set; } = true;
}