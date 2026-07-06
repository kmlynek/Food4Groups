namespace Food4Groups.Application.DTOs.Orders;

public class OrderOptionsResponse
{
    public Guid? GroupMemberId { get; set; }
    public Guid? GroupId { get; set; }
    public string? GroupName { get; set; }
    public List<OrderOptionMenuDayResponse> MenuDays { get; set; } = [];
}

public class OrderOptionMenuDayResponse
{
    public Guid Id { get; set; }
    public DateTime MenuDate { get; set; }
    public string? MenuPeriodName { get; set; }
    public List<OrderOptionDishResponse> Dishes { get; set; } = [];
    public List<OrderOptionAddonResponse> Addons { get; set; } = [];
}

public class OrderOptionDishResponse
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
}

public class OrderOptionAddonResponse
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
}