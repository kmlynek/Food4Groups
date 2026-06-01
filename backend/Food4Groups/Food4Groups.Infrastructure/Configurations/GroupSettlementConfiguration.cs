using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class GroupSettlementConfiguration : IEntityTypeConfiguration<GroupSettlement>
{
    public void Configure(EntityTypeBuilder<GroupSettlement> builder)
    {
        builder.ToTable("GroupSettlements");
        
        builder.HasKey(gs => gs.Id);

            builder.Property(x => x.OrdersCount)
                .IsRequired();

            builder.Property(x => x.TotalAmount)
                .HasPrecision(10, 2)
                .IsRequired();

            builder.Property(x => x.CreatedAt)
                .IsRequired();

            builder.HasOne(x => x.SettlementPeriod)
                .WithMany()
                .HasForeignKey(x => x.SettlementPeriodId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Group)
                .WithMany()
                .HasForeignKey(x => x.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => new { x.SettlementPeriodId, x.GroupId })
                .IsUnique();
    }
}