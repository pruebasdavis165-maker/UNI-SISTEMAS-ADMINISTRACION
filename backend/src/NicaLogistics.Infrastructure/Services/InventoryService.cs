using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InventoryMovementDto>> GetMovementsAsync(Guid? productoId = null, int limit = 100)
    {
        var query = _context.MovimientosInventario
            .Include(m => m.Producto)
            .Include(m => m.Usuario)
            .AsNoTracking();

        if (productoId.HasValue && productoId.Value != Guid.Empty)
        {
            query = query.Where(m => m.ProductoId == productoId.Value);
        }

        var list = await query
            .OrderByDescending(m => m.Fecha)
            .Take(limit)
            .Select(m => new InventoryMovementDto(
                m.Id,
                m.ProductoId,
                m.Producto != null ? m.Producto.Nombre : "Producto Eliminado",
                m.Producto != null ? m.Producto.CodigoSku : "—",
                m.TipoMovimiento,
                m.Cantidad,
                m.StockAnterior,
                m.StockNuevo,
                m.Motivo,
                m.Usuario != null ? m.Usuario.NombreCompleto : "Sistema",
                m.Fecha
            ))
            .ToListAsync();

        return list;
    }

    public async Task<InventoryMovementDto> RegisterMovementAsync(RegisterMovementDto dto, Guid? userId = null)
    {
        if (dto.Cantidad <= 0)
        {
            throw new InvalidOperationException("La cantidad debe ser mayor a cero.");
        }

        var product = await _context.Productos.FindAsync(dto.ProductoId)
            ?? throw new KeyNotFoundException("Producto no encontrado.");

        var stockAnterior = product.StockActual;
        int stockNuevo;

        var tipo = dto.TipoMovimiento.Trim().ToUpperInvariant();

        switch (tipo)
        {
            case "ENTRADA":
                stockNuevo = stockAnterior + dto.Cantidad;
                break;

            case "SALIDA":
                if (stockAnterior < dto.Cantidad)
                {
                    throw new InvalidOperationException($"Stock insuficiente. Existencia actual: {stockAnterior}, requerida: {dto.Cantidad}.");
                }
                stockNuevo = stockAnterior - dto.Cantidad;
                break;

            case "AJUSTE":
                stockNuevo = dto.Cantidad; // Ajuste directo al conteo físico
                break;

            default:
                throw new InvalidOperationException("Tipo de movimiento no válido. Use ENTRADA, SALIDA o AJUSTE.");
        }

        product.StockActual = stockNuevo;
        product.ActualizadoEn = DateTime.UtcNow;

        var movement = new InventoryMovement
        {
            Id = Guid.NewGuid(),
            ProductoId = product.Id,
            Producto = product,
            TipoMovimiento = tipo,
            Cantidad = dto.Cantidad,
            StockAnterior = stockAnterior,
            StockNuevo = stockNuevo,
            Motivo = dto.Motivo?.Trim() ?? "Ajuste manual de inventario",
            UsuarioId = userId,
            Fecha = DateTime.UtcNow
        };

        _context.MovimientosInventario.Add(movement);
        await _context.SaveChangesAsync();

        var user = userId.HasValue ? await _context.Usuarios.FindAsync(userId.Value) : null;

        return new InventoryMovementDto(
            movement.Id,
            movement.ProductoId,
            product.Nombre,
            product.CodigoSku,
            movement.TipoMovimiento,
            movement.Cantidad,
            movement.StockAnterior,
            movement.StockNuevo,
            movement.Motivo,
            user?.NombreCompleto ?? "Sistema",
            movement.Fecha
        );
    }

    public async Task<IEnumerable<InventoryAlertDto>> GetStockAlertsAsync()
    {
        var alerts = await _context.Productos
            .Where(p => p.Activo && p.StockActual <= p.StockMinimo)
            .OrderBy(p => p.StockActual)
            .Select(p => new InventoryAlertDto(
                p.Id,
                p.CodigoSku,
                p.Nombre,
                p.StockActual,
                p.StockMinimo,
                p.StockMinimo - p.StockActual,
                p.StockActual == 0 ? "CRITICO (AGOTADO)" : "BAJO (ALERTA)"
            ))
            .ToListAsync();

        return alerts;
    }
}
