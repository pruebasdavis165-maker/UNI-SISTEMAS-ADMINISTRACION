using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface IOrderService
{
    Task<OrderResponseDto> CreateOrderAsync(Guid clienteId, CreateOrderDto dto);
    Task<OrderResponseDto> GetOrderByIdAsync(Guid orderId, Guid? requestingUserId, string userRole);
    Task<IEnumerable<OrderResponseDto>> GetMyOrdersAsync(Guid clienteId);
    Task<IEnumerable<OrderResponseDto>> GetAllOrdersAsync(string? estado = null);
    Task<OrderResponseDto> CancelOrderAsync(Guid orderId, Guid userId, string userRole, string? motivo);
}
