using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class AddonConfiguration : IEntityTypeConfiguration<Addon>
{
    public void Configure(EntityTypeBuilder<Addon> builder)
    {
        builder.ToTable("Addons");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(1000);
        
        builder.Property(x => x.IsActive)
            .IsRequired();
        
        builder.Property(x => x.CreatedAt)
            .IsRequired();
    }
}