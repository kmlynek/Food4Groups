using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class MenuDayAddonConfiguration : IEntityTypeConfiguration<MenuDayAddon>
{
    public void Configure(EntityTypeBuilder<MenuDayAddon> builder)
    {
        builder.ToTable("MenuDayAddons");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.MenuDay)
            .WithMany()
            .HasForeignKey(x => x.MenuDayId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Addon)
            .WithMany()
            .HasForeignKey(x => x.AddonId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasIndex(x => new { x.MenuDayId, x.AddonId })
            .IsUnique();
    }
}
