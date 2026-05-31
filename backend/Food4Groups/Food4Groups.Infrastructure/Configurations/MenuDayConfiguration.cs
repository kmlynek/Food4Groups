using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class MenuDayConfiguration : IEntityTypeConfiguration<MenuDay>
{
    public void Configure(EntityTypeBuilder<MenuDay> builder)
    {
        builder.ToTable("MenuDays");
        
        builder.HasKey(x => x.Id);

        builder.Property(x => x.MenuDate)
            .IsRequired();
        
        builder.Property(x => x.IsActive)
            .IsRequired();
        
        builder.Property(x => x.CreatedAt)
            .IsRequired();
        
        builder.HasOne(x => x.MenuPeriod)
            .WithMany()
            .HasForeignKey(x => x.MenuPeriodId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.MenuPeriodId, x.MenuDate })
            .IsUnique();;
    }
}