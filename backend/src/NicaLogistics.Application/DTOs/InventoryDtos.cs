namespace NicaLogistics.Application.DTOs;

public record InventoryMovementDto(
    Guid Id,
    Guid ProductoId,
    string ProductoNombre,
    string CodigoSku,
    string TipoMovimiento,
    int Cantidad,
    int StockAnterior,
    int StockNuevo,
    string? Motivo,
    string? UsuarioNombre,
    DateTime Fecha
);

public record RegisterMovementDto(
    Guid ProductoId,
    string TipoMovimiento, // ENTRADA, SALIDA, AJUSTE
    int Cantidad,
    string Motivo
);

public record InventoryAlertDto(
    Guid ProductoId,
    string CodigoSku,
    string Nombre,
    int StockActual,
    int StockMinimo,
    int Deficit,
    string NivelAlerta // CRITICO, BAJO
);
