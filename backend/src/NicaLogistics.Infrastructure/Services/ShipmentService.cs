using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class ShipmentService : IShipmentService
{
    private readonly AppDbContext _context;
    private readonly INotificationService _notificationService;

    public ShipmentService(AppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<ShipmentResponseDto> GetByTrackingCodeAsync(string trackingCode)
    {
        var cleaned = trackingCode.Trim().ToUpper();
        var shipment = await _context.Encomiendas
            .Include(e => e.Pedido)
            .Include(e => e.Cliente)
            .Include(e => e.SedeOrigen)
            .Include(e => e.SedeDestino)
            .Include(e => e.EmpleadoEntrega)
            .Include(e => e.Historial).ThenInclude(h => h.UbicacionSede)
            .Include(e => e.Historial).ThenInclude(h => h.RegistradoPor)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.CodigoTracking.ToUpper() == cleaned);

        if (shipment == null)
            throw new KeyNotFoundException($"No se encontró ninguna encomienda con el código '{trackingCode}'.");

        return MapToDto(shipment);
    }

    public async Task<ShipmentResponseDto> GetByIdAsync(Guid id)
    {
        var shipment = await _context.Encomiendas
            .Include(e => e.Pedido)
            .Include(e => e.Cliente)
            .Include(e => e.SedeOrigen)
            .Include(e => e.SedeDestino)
            .Include(e => e.EmpleadoEntrega)
            .Include(e => e.Historial).ThenInclude(h => h.UbicacionSede)
            .Include(e => e.Historial).ThenInclude(h => h.RegistradoPor)
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.Id == id);

        if (shipment == null)
            throw new KeyNotFoundException("Encomienda no encontrada.");

        return MapToDto(shipment);
    }

    public async Task<IEnumerable<ShipmentResponseDto>> GetAllAsync(string? estado = null, Guid? sedeId = null)
    {
        var query = _context.Encomiendas
            .Include(e => e.Pedido)
            .Include(e => e.Cliente)
            .Include(e => e.SedeOrigen)
            .Include(e => e.SedeDestino)
            .Include(e => e.EmpleadoEntrega)
            .Include(e => e.Historial).ThenInclude(h => h.UbicacionSede)
            .Include(e => e.Historial).ThenInclude(h => h.RegistradoPor)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(estado))
        {
            query = query.Where(e => e.Estado.ToUpper() == estado.ToUpper());
        }

        if (sedeId.HasValue)
        {
            query = query.Where(e => e.SedeOrigenId == sedeId.Value || e.SedeDestinoId == sedeId.Value);
        }

        var shipments = await query
            .OrderByDescending(e => e.FechaRegistro)
            .ToListAsync();

        return shipments.Select(MapToDto);
    }

    public async Task<IEnumerable<ShipmentResponseDto>> GetMyShipmentsAsync(Guid clienteId)
    {
        var shipments = await _context.Encomiendas
            .Include(e => e.Pedido)
            .Include(e => e.Cliente)
            .Include(e => e.SedeOrigen)
            .Include(e => e.SedeDestino)
            .Include(e => e.EmpleadoEntrega)
            .Include(e => e.Historial).ThenInclude(h => h.UbicacionSede)
            .Include(e => e.Historial).ThenInclude(h => h.RegistradoPor)
            .Where(e => e.ClienteId == clienteId)
            .OrderByDescending(e => e.FechaRegistro)
            .AsNoTracking()
            .ToListAsync();

        return shipments.Select(MapToDto);
    }

    public async Task<ShipmentResponseDto> UpdateStatusAsync(Guid shipmentId, Guid empleadoId, UpdateShipmentStatusDto dto)
    {
        var validStates = new[] { "REGISTRADA", "EN_TRANSITO", "LISTA_PARA_RETIRO", "ENTREGADA" };
        var normalizedState = dto.NuevoEstado.Trim().ToUpper();

        if (!validStates.Contains(normalizedState))
            throw new InvalidOperationException($"El estado '{dto.NuevoEstado}' no es un estado logístico válido.");

        var shipment = await _context.Encomiendas
            .Include(e => e.SedeDestino)
            .Include(e => e.Cliente)
            .FirstOrDefaultAsync(e => e.Id == shipmentId);

        if (shipment == null)
            throw new KeyNotFoundException("Encomienda no encontrada.");

        if (shipment.Estado == "ENTREGADA" || shipment.Estado == "CANCELADA")
            throw new InvalidOperationException($"No se puede alterar una encomienda que ya está en estado '{shipment.Estado}'.");

        shipment.Estado = normalizedState;
        shipment.ActualizadoEn = DateTime.UtcNow;

        if (normalizedState == "ENTREGADA")
        {
            shipment.EmpleadoEntregaId = empleadoId;
            shipment.FechaEntrega = DateTime.UtcNow;
        }

        // Registrar hito en historial de tracking (RF-10)
        var ubicacionId = dto.UbicacionSedeId ?? (normalizedState == "LISTA_PARA_RETIRO" ? shipment.SedeDestinoId : shipment.SedeOrigenId);
        var history = new TrackingHistory
        {
            EncomiendaId = shipment.Id,
            Estado = normalizedState,
            UbicacionSedeId = ubicacionId,
            Comentario = dto.Comentario ?? GetDefaultCommentForState(normalizedState, shipment.SedeDestino?.Nombre),
            RegistradoPorId = empleadoId,
            Fecha = DateTime.UtcNow
        };
        await _context.HistorialTracking.AddAsync(history);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(shipmentId);
    }

    public async Task<ShipmentResponseDto> DeliverShipmentAsync(Guid shipmentId, Guid empleadoId, string? notas)
    {
        return await UpdateStatusAsync(shipmentId, empleadoId, new UpdateShipmentStatusDto(
            "ENTREGADA",
            null,
            notas ?? "Entregado en ventanilla al cliente con verificación de identificación oficial."
        ));
    }

    private static string GetDefaultCommentForState(string state, string? sedeDestinoNombre)
    {
        return state switch
        {
            "EN_TRANSITO" => "El paquete está en traslado logístico hacia la sede de retiro.",
            "LISTA_PARA_RETIRO" => $"El paquete ha ingresado a la sede de destino ({sedeDestinoNombre ?? "Sucursal"}) y se encuentra en ventanilla listo para retiro.",
            "ENTREGADA" => "Paquete entregado con éxito al titular en ventanilla oficial.",
            _ => "Estado actualizado."
        };
    }

    private static ShipmentResponseDto MapToDto(Shipment s)
    {
        var historyList = (s.Historial ?? new List<TrackingHistory>())
            .OrderBy(h => h.Fecha)
            .Select(h => new TrackingHistoryDto(
                h.Id,
                h.Estado,
                h.UbicacionSede?.Nombre,
                h.Comentario,
                h.RegistradoPor?.NombreCompleto,
                h.Fecha
            ))
            .ToList();

        return new ShipmentResponseDto(
            s.Id,
            s.CodigoTracking,
            s.PedidoId,
            s.Pedido?.NumeroPedido ?? "",
            s.ClienteId,
            s.Cliente?.NombreCompleto ?? "Cliente",
            s.Cliente?.Email ?? "",
            s.SedeOrigenId,
            s.SedeOrigen?.Nombre ?? "Sede Origen",
            s.SedeOrigen?.DireccionVentanilla ?? "",
            s.SedeDestinoId,
            s.SedeDestino?.Nombre ?? "Sede Destino",
            s.SedeDestino?.DireccionVentanilla ?? "",
            s.Estado,
            s.EmpleadoEntrega?.NombreCompleto,
            s.FechaEntrega,
            s.FechaRegistro,
            historyList
        );
    }
}
