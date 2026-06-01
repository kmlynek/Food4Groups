using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class SettlementPeriodConfiguration : IEntityTypeConfiguration<SettlementPeriod>
{
    public void Configure(EntityTypeBuilder<SettlementPeriod> builder)
    {
        builder.ToTable("SettlementPeriod");
        
        builder.HasKey(x  => x.Id);
        
        builder.Property(x => x.Name)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(x => x.StartDate)
            .IsRequired();

        builder.Property(x => x.EndDate)
            .IsRequired();

        builder.Property(x => x.IsClosed)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.CateringCompany)
            .WithMany()
            .HasForeignKey(x => x.CateringCompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.CateringCompanyId, x.StartDate, x.EndDate })
            .IsUnique();
    }
}