namespace Food4Groups.Application.DTOs.PackageAddons;

public class CreatePackageAddonRequest
{
    public Guid PackageId { get; set; }
    public Guid AddonId { get; set; }
}