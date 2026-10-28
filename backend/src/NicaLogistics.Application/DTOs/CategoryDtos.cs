namespace NicaLogistics.Application.DTOs;

public record CategoryDto(
    Guid Id,
    string Nombre,
    string? Descripcion,
    bool Activo,
    int TotalProductos,
    DateTime CreadoEn
);

public record CreateCategoryDto(
    string Nombre,
    string? Descripcion
);

public record UpdateCategoryDto(
    string Nombre,
    string? Descripcion,
    bool Activo
);
