using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.GroupMember)
            .WithMany()
            .HasForeignKey(x => x.GroupMemberId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.MenuDay)
            .WithMany()
            .HasForeignKey(x => x.MenuDayId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Dish)
            .WithMany()
            .HasForeignKey(x => x.DishId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.OrderStatus)
            .WithMany()
            .HasForeignKey(x => x.OrderStatusId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.GroupMemberId, x.MenuDayId })
            .IsUnique(); // 1 zamówienie group memebra na dzień 
    }
}