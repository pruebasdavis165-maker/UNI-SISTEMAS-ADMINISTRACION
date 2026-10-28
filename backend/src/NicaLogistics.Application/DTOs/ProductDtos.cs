namespace NicaLogistics.Application.DTOs;

public record ProductDto(
    Guid Id,
    string CodigoSku,
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int StockActual,
    int StockMinimo,
    string? ImagenUrl,
    Guid CategoriaId,
    string CategoriaNombre,
    bool Activo,
    DateTime CreadoEn
);

public record CreateProductDto(
    string CodigoSku,
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int StockActual,
    int StockMinimo,
    string? ImagenUrl,
    Guid CategoriaId
);

public record UpdateProductDto(
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int StockMinimo,
    string? ImagenUrl,
    Guid CategoriaId,
    bool Activo
);
