namespace NicaLogistics.Application.DTOs;

public record CustomerSummaryDto(
    Guid Id,
    string NombreCompleto,
    string Email,
    string? Telefono,
    bool Activo,
    int TotalPedidos,
    decimal TotalGastado,
    int TotalEncomiendas,
    DateTime FechaRegistro
);

public record CustomerOrderSummaryDto(
    Guid Id,
    string NumeroPedido,
    decimal Total,
    string Estado,
    string SedeOrigen,
    string SedeDestino,
    DateTime Fecha
);

public record CustomerShipmentSummaryDto(
    Guid Id,
    string CodigoTracking,
    string Estado,
    string SedeOrigen,
    string SedeDestino,
    DateTime FechaRegistro,
    DateTime? FechaEntrega
);

public record CustomerDetailDto(
    Guid Id,
    string NombreCompleto,
    string Email,
    string? Telefono,
    bool Activo,
    DateTime FechaRegistro,
    decimal TotalGastado,
    IEnumerable<CustomerOrderSummaryDto> Pedidos,
    IEnumerable<CustomerShipmentSummaryDto> Encomiendas
);
