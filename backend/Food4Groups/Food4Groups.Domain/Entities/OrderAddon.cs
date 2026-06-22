using Food4Groups.Domain.Common;

namespace Food4Groups.Domain.Entities;

public class OrderAddon : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid AddonId { get; set; }

    public Order? Order { get; set; }
    public Addon? Addon { get; set; }
}