using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class GroupPackageAssignmentConfiguration : IEntityTypeConfiguration<GroupPackageAssignment>
{
    public void Configure(EntityTypeBuilder<GroupPackageAssignment> builder)
    {
        builder.ToTable("GroupPackageAssignments");

        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.ActiveFrom)
            .IsRequired();
        
        builder.Property(x => x.IsActive)
            .IsRequired();
        
        builder.Property(x => x.CreatedAt)
            .IsRequired();
        
        builder.HasOne(x => x.Group)
            .WithMany()
            .HasForeignKey(x => x.GroupId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Package)
            .WithMany()
            .HasForeignKey(x => x.PackageId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(x => new { x.GroupId, x.PackageId, x.ActiveFrom })
            .IsUnique();
    }
}