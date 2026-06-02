using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

public class GroupConfiguration : IEntityTypeConfiguration<Group>
{

    public void Configure(EntityTypeBuilder<Group> builder)
    {
        builder.ToTable("Groups");

        builder.HasKey(x=>x.Id);
        
        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.MemberCount)
            .IsRequired();
        
        builder.Property(x=>x.CreatedAt)
            .IsRequired();

        builder.HasOne(x => x.CateringCompany)
            .WithMany()
            .HasForeignKey(x => x.CateringCompanyId)
            .OnDelete(DeleteBehavior.Cascade);

    }
}