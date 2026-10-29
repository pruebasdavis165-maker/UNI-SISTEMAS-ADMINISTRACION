namespace NicaLogistics.Application.DTOs;

public record SedeDto(
    Guid Id,
    string Codigo,
    string Nombre,
    string Pais,
    string Ciudad,
    string DireccionVentanilla,
    string? TelefonoContacto,
    string? HorarioAtencion,
    bool Activo
);

public record CreateSedeDto(
    string Codigo,
    string Nombre,
    string Pais,
    string Ciudad,
    string DireccionVentanilla,
    string? TelefonoContacto,
    string? HorarioAtencion
);

public record UpdateSedeDto(
    string Nombre,
    string Pais,
    string Ciudad,
    string DireccionVentanilla,
    string? TelefonoContacto,
    string? HorarioAtencion,
    bool Activo
);
