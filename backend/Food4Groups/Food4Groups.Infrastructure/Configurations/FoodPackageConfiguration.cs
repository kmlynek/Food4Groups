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
            .HasMaxLength(120)
            .IsRequired();
        
        builder.Property(x=>x.MaxDishesPerDay)
            .IsRequired();
        
        builder.Property(x => x.PricePerPerson)
            .HasPrecision(10, 2) // 10 cyfr do 2 po przecinku
            .IsRequired();
        
        builder.Property(x => x.IsActive)
            .IsRequired();
    }
}