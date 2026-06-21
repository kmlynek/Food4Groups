using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class MenuPeriodConfiguration : IEntityTypeConfiguration<MenuPeriod>
{
    public void Configure(EntityTypeBuilder<MenuPeriod> builder)
    {
        builder.ToTable("MenuPeriods");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name)
            .HasMaxLength(120)
            .IsRequired();
        
        builder.Property(x => x.StartDate)
            .IsRequired();
        
        builder.Property(x => x.EndDate)
            .IsRequired();
        
        builder.Property(x => x.IsActive)
            .IsRequired();
        
        builder.Property(x => x.CreatedAt)
            .IsRequired();
        
        // Okres menu należy do konkretnej firmy cateringowej
        builder.HasOne(x => x.CateringCompany)
            .WithMany()
            .HasForeignKey(x => x.CateringCompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}