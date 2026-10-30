namespace NicaLogistics.Application.DTOs;

public record FormaEnvioDto(
    Guid Id,
    string Nombre,
    string Codigo,
    string TipoRuta,
    decimal TarifaBase,
    decimal TarifaPorLibra,
    string TiempoEstimado,
    string? Descripcion,
    bool Activo
);

public record UpdateFormaEnvioDto(
    string Nombre,
    decimal TarifaBase,
    decimal TarifaPorLibra,
    string TiempoEstimado,
    string? Descripcion,
    bool Activo
);

public record CreateFormaEnvioDto(
    string Nombre,
    string Codigo,
    string TipoRuta,
    decimal TarifaBase,
    decimal TarifaPorLibra,
    string TiempoEstimado,
    string? Descripcion
);

public record CotizarEnvioRequestDto(
    Guid SedeOrigenId,
    Guid SedeDestinoId,
    decimal PesoTotalLibras
);

public record OpcionEnvioDto(
    string Modalidad,
    string Codigo,
    decimal Costo,
    string TiempoEstimado,
    string TipoRuta,
    string Descripcion
);
