using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductDto>> GetAllAsync(string? search = null, Guid? categoriaId = null, bool? activeOnly = null)
    {
        var query = _context.Productos
            .Include(p => p.Categoria)
            .AsNoTracking();

        if (activeOnly.HasValue && activeOnly.Value)
        {
            query = query.Where(p => p.Activo);
        }

        if (categoriaId.HasValue && categoriaId.Value != Guid.Empty)
        {
            query = query.Where(p => p.CategoriaId == categoriaId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(p => p.Nombre.ToLower().Contains(searchLower) || 
                                     p.CodigoSku.ToLower().Contains(searchLower) ||
                                     (p.Descripcion != null && p.Descripcion.ToLower().Contains(searchLower)));
        }

        var products = await query
            .OrderBy(p => p.Nombre)
            .Select(p => new ProductDto(
                p.Id,
                p.CodigoSku,
                p.Nombre,
                p.Descripcion,
                p.Precio,
                p.StockActual,
                p.StockMinimo,
                p.ImagenUrl,
                p.CategoriaId,
                p.Categoria != null ? p.Categoria.Nombre : "Sin Categoría",
                p.Activo,
                p.CreadoEn
            ))
            .ToListAsync();

        return products;
    }

    public async Task<ProductDto> GetByIdAsync(Guid id)
    {
        var p = await _context.Productos
            .Include(p => p.Categoria)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null)
            throw new KeyNotFoundException("Producto no encontrado.");

        return new ProductDto(
            p.Id,
            p.CodigoSku,
            p.Nombre,
            p.Descripcion,
            p.Precio,
            p.StockActual,
            p.StockMinimo,
            p.ImagenUrl,
            p.CategoriaId,
            p.Categoria?.Nombre ?? "Sin Categoría",
            p.Activo,
            p.CreadoEn
        );
    }

    public async Task<ProductDto> CreateAsync(CreateProductDto dto, Guid? userId = null)
    {
        var normalizedSku = dto.CodigoSku.Trim().ToUpperInvariant();

        if (await _context.Productos.AnyAsync(p => p.CodigoSku.ToUpper() == normalizedSku))
        {
            throw new InvalidOperationException("Ya existe un producto con el SKU indicado.");
        }

        var category = await _context.Categorias.FindAsync(dto.CategoriaId)
            ?? throw new InvalidOperationException("La categoría indicada no existe.");

        var product = new Product
        {
            Id = Guid.NewGuid(),
            CodigoSku = normalizedSku,
            Nombre = dto.Nombre.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            Precio = dto.Precio,
            StockActual = dto.StockActual,
            StockMinimo = dto.StockMinimo,
            ImagenUrl = dto.ImagenUrl?.Trim(),
            CategoriaId = category.Id,
            Categoria = category,
            Activo = true,
            CreadoEn = DateTime.UtcNow,
            ActualizadoEn = DateTime.UtcNow
        };

        _context.Productos.Add(product);

        // Registro automático de movimiento de inventario inicial (RF-07)
        if (product.StockActual > 0)
        {
            _context.MovimientosInventario.Add(new InventoryMovement
            {
                Id = Guid.NewGuid(),
                ProductoId = product.Id,
                TipoMovimiento = "ENTRADA",
                Cantidad = product.StockActual,
                StockAnterior = 0,
                StockNuevo = product.StockActual,
                Motivo = "Inventario inicial al crear producto",
                UsuarioId = userId,
                Fecha = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();

        return new ProductDto(
            product.Id,
            product.CodigoSku,
            product.Nombre,
            product.Descripcion,
            product.Precio,
            product.StockActual,
            product.StockMinimo,
            product.ImagenUrl,
            product.CategoriaId,
            category.Nombre,
            product.Activo,
            product.CreadoEn
        );
    }

    public async Task<ProductDto> UpdateAsync(Guid id, UpdateProductDto dto)
    {
        var product = await _context.Productos
            .Include(p => p.Categoria)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            throw new KeyNotFoundException("Producto no encontrado.");

        var category = await _context.Categorias.FindAsync(dto.CategoriaId)
            ?? throw new InvalidOperationException("La categoría indicada no existe.");

        product.Nombre = dto.Nombre.Trim();
        product.Descripcion = dto.Descripcion?.Trim();
        product.Precio = dto.Precio;
        product.StockMinimo = dto.StockMinimo;
        product.ImagenUrl = dto.ImagenUrl?.Trim();
        product.CategoriaId = category.Id;
        product.Categoria = category;
        product.Activo = dto.Activo;
        product.ActualizadoEn = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new ProductDto(
            product.Id,
            product.CodigoSku,
            product.Nombre,
            product.Descripcion,
            product.Precio,
            product.StockActual,
            product.StockMinimo,
            product.ImagenUrl,
            product.CategoriaId,
            category.Nombre,
            product.Activo,
            product.CreadoEn
        );
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var product = await _context.Productos.FindAsync(id);
        if (product == null)
            throw new KeyNotFoundException("Producto no encontrado.");

        // Soft delete
        product.Activo = false;
        product.ActualizadoEn = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }
}
