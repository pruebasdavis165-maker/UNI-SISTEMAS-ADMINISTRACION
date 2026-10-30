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
    DateTime CreadoEn,
    decimal PesoLibras = 1.0m
);

public record CreateProductDto(
    string CodigoSku,
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int StockActual,
    int StockMinimo,
    string? ImagenUrl,
    Guid CategoriaId,
    decimal PesoLibras = 1.0m
);

public record UpdateProductDto(
    string Nombre,
    string? Descripcion,
    decimal Precio,
    int StockMinimo,
    string? ImagenUrl,
    Guid CategoriaId,
    bool Activo,
    decimal PesoLibras = 1.0m
);
