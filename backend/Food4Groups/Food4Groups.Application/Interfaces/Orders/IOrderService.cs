using Food4Groups.Application.DTOs.Orders;

namespace Food4Groups.Application.Interfaces.Orders;

public interface IOrderService
{
    Task<List<OrderResponse>> GetAllAsync();
    Task<List<OrderResponse>> GetMyOrdersAsync(string currentUserId);
    Task<OrderResponse?> GetByIdAsync(Guid id);
    Task<List<OrderStatusResponse>> GetStatusesAsync();
    Task<OrderOptionsResponse> GetOptionsAsync(string currentUserId);
    Task<OrderResponse> CreateAsync(string currentUserId, CreateOrderRequest request);
    Task<OrderResponse?> ChangeStatusAsync(Guid id, string changedByUserId, ChangeOrderStatusRequest request);
}