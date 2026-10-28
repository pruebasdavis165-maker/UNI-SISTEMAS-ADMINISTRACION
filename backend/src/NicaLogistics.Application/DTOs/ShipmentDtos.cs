namespace NicaLogistics.Application.DTOs;

public record TrackingHistoryDto(
    Guid Id,
    string Estado,
    string? UbicacionSede,
    string? Comentario,
    string? RegistradoPor,
    DateTime Fecha
);

public record ShipmentResponseDto(
    Guid Id,
    string CodigoTracking,
    Guid PedidoId,
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
    string Estado, // REGISTRADA, EN_TRANSITO, LISTA_PARA_RETIRO, ENTREGADA, CANCELADA
    string? EmpleadoEntregaNombre,
    DateTime? FechaEntrega,
    DateTime FechaRegistro,
    IEnumerable<TrackingHistoryDto> Historial
);

public record UpdateShipmentStatusDto(
    string NuevoEstado, // EN_TRANSITO, LISTA_PARA_RETIRO, ENTREGADA
    Guid? UbicacionSedeId,
    string? Comentario
);
