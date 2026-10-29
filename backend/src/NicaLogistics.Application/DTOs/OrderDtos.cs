namespace NicaLogistics.Application.DTOs;

public record OrderItemRequestDto(
    Guid ProductoId,
    int Cantidad
);

public record CreateOrderDto(
    Guid SedeOrigenId,
    Guid SedeDestinoId,
    string MetodoPago, // TARJETA, TRANSFERENCIA, VENTANILLA
    string? ReferenciaTransaccion,
    List<OrderItemRequestDto> Items
);

public record OrderItemDetailDto(
    Guid Id,
    Guid ProductoId,
    string ProductoNombre,
    string ProductoSku,
    string? ImagenUrl,
    int Cantidad,
    decimal PrecioUnitario,
    decimal Subtotal
);

public record OrderResponseDto(
    Guid Id,
    string NumeroPedido,
    Guid ClienteId,
    string ClienteNombre,
    string ClienteEmail,
    Guid SedeOrigenId,
    string SedeOrigenNombre,
    string SedeOrigenDireccion,
    Guid SedeDestinoId,
    string SedeDestinoNombre,
    string SedeDestinoDireccion,
    decimal Total,
    string Estado,
    string? MetodoPago,
    string? CodigoTracking,
    DateTime CreadoEn,
    IEnumerable<OrderItemDetailDto> Items,
    string? EstadoEncomienda = null
);

public record CancelOrderDto(
    string? Motivo
);
