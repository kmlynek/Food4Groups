using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class OrderStatus : BaseEntity
{
    public required string Name { get; set; }
    public bool IsFinal { get; set; } = false;
    public bool IsActive { get; set; } = true;
 
}