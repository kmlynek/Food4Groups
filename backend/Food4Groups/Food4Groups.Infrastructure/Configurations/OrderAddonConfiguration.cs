using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class OrderAddonConfiguration : IEntityTypeConfiguration<OrderAddon>
{
    public void Configure(EntityTypeBuilder<OrderAddon> builder)
    {
        builder.ToTable("OrderAddons");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.CreatedAt)
            .IsRequired();
        
        builder.Property(x => x.UpdatedAt)
            .IsRequired();
        
        builder.HasOne(x => x.Order)
            .WithMany()
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Addon)
            .WithMany()
            .HasForeignKey(x => x.AddonId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.OrderId, x.AddonId })
            .IsUnique();
    }
}