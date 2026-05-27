using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class PackageConfiguration : IEntityTypeConfiguration<Package>
{
    public void Configure(EntityTypeBuilder<Package> builder)
    {
        builder.ToTable("Packages");
        
        builder.HasKey(x=>x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(120)
            .IsRequired();
        
        builder.Property(x => x.PricePerPerson)
            .HasPrecision(10, 2) // 10 cyfr do 2 po przecinku
            .IsRequired();
        
        builder.Property(x => x.IsActive)
            .IsRequired();
    }
}