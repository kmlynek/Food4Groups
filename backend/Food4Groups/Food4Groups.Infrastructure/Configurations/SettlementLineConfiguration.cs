using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class SettlementLineConfiguration : IEntityTypeConfiguration<SettlementLine>
{
    public void Configure(EntityTypeBuilder<SettlementLine> builder)
    {
        builder.ToTable("SettlementLines");

        builder.Property(x => x.Id);
        
        builder.Property(x => x.PackagePrice)
            .HasPrecision(10, 2)
            .IsRequired();
        
        builder.Property(x => x.AddonsPrice)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(x => x.TotalPrice)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.GroupSettlement)
            .WithMany()
            .HasForeignKey(x => x.GroupSettlementId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Order)
            .WithMany()
            .HasForeignKey(x => x.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.GroupSettlementId, x.OrderId })
            .IsUnique();
    }
}