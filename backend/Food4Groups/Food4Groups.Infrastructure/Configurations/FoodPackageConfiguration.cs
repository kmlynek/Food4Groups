using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class FoodPackageConfiguration : IEntityTypeConfiguration<FoodPackage>
{
    public void Configure(EntityTypeBuilder<FoodPackage> builder)
    {
        builder.ToTable("FoodPackages");
        
        builder.HasKey(x=>x.Id);

        builder.Property(x => x.Name)
            .IsRequired();
        
        builder.Property(x=>x.MaxDishesPerDay)
            .HasMaxLength(100)
            .IsRequired();
    }
}