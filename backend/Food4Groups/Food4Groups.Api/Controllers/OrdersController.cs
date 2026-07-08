using System.Security.Claims;
using Food4Groups.Application.DTOs.Orders;
using Food4Groups.Application.Interfaces.Orders;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Food4Groups.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> GetAll()
    {
        var orders = await _orderService.GetAllAsync();

        return Ok(orders);
    }

    [HttpGet("my")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> GetMyOrders()
    {
        try
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var orders = await _orderService.GetMyOrdersAsync(currentUserId ?? string.Empty);

            return Ok(orders);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(exception.Message);
        }
    }

    [HttpGet("coordinator")]
    [Authorize(Roles = "GroupCoordinator")]
    public async Task<IActionResult> GetCoordinatorOrders()
    {
        try
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var orders = await _orderService.GetCoordinatorOrdersAsync(currentUserId ?? string.Empty);

            return Ok(orders);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(exception.Message);
        }
    }

    [HttpGet("statuses")]
    [Authorize]
    public async Task<IActionResult> GetStatuses()
    {
        var statuses = await _orderService.GetStatusesAsync();

        return Ok(statuses);
    }

    [HttpGet("options")]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> GetOptions()
    {
        try
        {
            // Opcje zamówienia są wyliczane dla aktualnego klienta na podstawie jego grupy i aktywnego pakietu
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var options = await _orderService.GetOptionsAsync(currentUserId ?? string.Empty);

            return Ok(options);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(exception.Message);
        }
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var order = await _orderService.GetByIdAsync(id);

        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost]
    [Authorize(Roles = "User")]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        try
        {
            // Klient składa zamówienie wyłącznie w ramach własnego członkostwa w grupie
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var order = await _orderService.CreateAsync(currentUserId ?? string.Empty, request);

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin, CateringEmployee")]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] ChangeOrderStatusRequest request)
    {
        try
        {
            // Zmiana statusu zamówienia zapisuje również historię wykonanej operacji
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var order = await _orderService.ChangeStatusAsync(id, currentUserId ?? string.Empty, request);

            return order is null ? NotFound() : Ok(order);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (UnauthorizedAccessException exception)
        {
            return Unauthorized(exception.Message);
        }
        catch (KeyNotFoundException exception)
        {
            return NotFound(exception.Message);
        }
        catch (InvalidOperationException exception)
        {
            return Conflict(exception.Message);
        }
    }
}
