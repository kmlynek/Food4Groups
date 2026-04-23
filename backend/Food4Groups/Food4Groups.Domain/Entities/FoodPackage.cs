namespace Food4Groups.Domain.Entities;

public class FoodPackage
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public int MaxDishesPerDay { get; set; }
    public decimal PricePerPerson { get; set; }
    public bool IsActive { get; set; } = true;
}