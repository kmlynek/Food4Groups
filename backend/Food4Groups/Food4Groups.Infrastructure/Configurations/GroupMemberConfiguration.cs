using Food4Groups.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;



namespace Food4Groups.Infrastructure.Configurations;

public class GroupMemberConfiguration : IEntityTypeConfiguration<GroupMember>
{
    public void Configure(EntityTypeBuilder<GroupMember> builder)
    {
        builder.ToTable("GroupMembers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserId)
            .HasMaxLength(458)
            .IsRequired();
        
        builder.Property(x=> x.IsActive)
            .IsRequired();
        
        builder.Property(x=> x.JoinedAt)
            .IsRequired();
        
        builder.HasOne(x=> x.Group)
            .WithMany()
            .HasForeignKey(x=> x.GroupId)
            .OnDelete(DeleteBehavior.Cascade); // Jeśli usuniesz Group, to usuń GroupMembers
        
        builder.HasOne<IdentityUser>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict); // Nie usuwaj użytkownika jeśli istnieją powiązane GroupMember
        
        builder.HasIndex(x=> new { x.GroupId, x.UserId }) 
            .IsUnique(); // Ten sam User nie może należeć do tej samej Grupy
    }
}