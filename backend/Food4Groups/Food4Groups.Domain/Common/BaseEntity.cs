namespace Food4Groups.Domain.Common;

public abstract class BaseEntity
{
    // Wspolne pola dziedziczone przez encje
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; }
}