using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class PackageAddonConfiguration : IEntityTypeConfiguration<PackageAddon>
{
    public void Configure(EntityTypeBuilder<PackageAddon> builder)
    {
        builder.ToTable("PackageAddons");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.IsActive)
            .IsRequired();
        
        builder.Property(x => x.CreatedAt)
            .IsRequired();
        
        builder.HasOne(x => x.Package)
            .WithMany()
            .HasForeignKey(x => x.PackageId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Addon)
            .WithMany()
            .HasForeignKey(x => x.AddonId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(x => new  { x.PackageId, x.AddonId })
            .IsUnique();
    }
    
}