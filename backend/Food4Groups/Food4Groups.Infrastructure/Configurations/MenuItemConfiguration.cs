using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class MenuItemConfiguration : IEntityTypeConfiguration<MenuItem>
{
    public void Configure(EntityTypeBuilder<MenuItem> builder)
    {
        builder.ToTable("MenuItems");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.IsActive)
            .IsRequired();
        
        builder.Property(x => x.CreatedAt)
            .IsRequired();
        
        builder.Property(x => x.UpdatedAt)
            .IsRequired();
        
        
        builder.HasOne(x => x.MenuDay)
            .WithMany()
            .HasForeignKey(x => x.MenuDayId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasOne(x => x.Dish)
            .WithMany()
            .HasForeignKey(x => x.DishId)
            .OnDelete(DeleteBehavior.Restrict);
        
        
        builder.HasIndex(x => new {x.MenuDayId, x.DishId})
            .IsUnique();
    }
}