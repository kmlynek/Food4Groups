using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class PackageDishConfiguration : IEntityTypeConfiguration<PackageDish>
{
    public void Configure(EntityTypeBuilder<PackageDish> builder)
    {
        builder.ToTable("PackageDishes");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.IsActive)
            .IsRequired();
        
        builder.Property(x => x.CreatedAt)
            .IsRequired();
        
        builder.HasOne(x => x.Package)
            .WithMany()
            .HasForeignKey(x => x.PackageId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Dish)
            .WithMany()
            .HasForeignKey(x => x.DishId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(x => new { x.PackageId, x.DishId })
            .IsUnique();
    }
    
}