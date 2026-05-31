namespace Food4Groups.Domain.Entities;

public class PackageAddon
{
    public Guid Id { get; set; }
    public Guid PackageId { get; set; }
    public Guid AddonId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Package? Package { get; set; }
    public Addon? Addon { get; set; }
    
}