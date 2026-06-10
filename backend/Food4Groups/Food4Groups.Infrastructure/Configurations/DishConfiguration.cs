using Food4Groups.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Food4Groups.Infrastructure.Configurations;

//Konfiguracja EF mapowania encji do bazy danych (modelu bazy danych)- okeśla strukturę, ograniczenia, właściwości
public class DishConfiguration : IEntityTypeConfiguration<Dish>
{
    public void Configure(EntityTypeBuilder<Dish> builder)
    {
        builder.ToTable("Dishes");
        
        builder.HasKey(x => x.Id);
        
        builder.Property(x => x.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(1000);
        
        builder.Property(x=> x.IsActive)
            .IsRequired();
        
        builder.Property(x=> x.CreatedAt)
            .IsRequired();

        builder.Property(x => x.UpdatedAt);
    }
}