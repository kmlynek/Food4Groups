using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class PrintTemplateConfiguration : IEntityTypeConfiguration<PrintTemplate>
{
    public void Configure(EntityTypeBuilder<PrintTemplate> builder)
    {
        builder.ToTable("PrintTemplates");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Code)
            .HasMaxLength(80)
            .IsRequired();

        builder.Property(x => x.Name)
            .HasMaxLength(160)
            .IsRequired();

        builder.Property(x => x.TitleTemplate)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.BodyTemplate)
            .HasMaxLength(3000)
            .IsRequired();

        builder.Property(x => x.FooterTemplate)
            .HasMaxLength(1000)
            .IsRequired();

        builder.Property(x => x.IsActive)
            .IsRequired();

        builder.Property(x => x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        builder.HasIndex(x => x.Code)
            .IsUnique();
    }
}