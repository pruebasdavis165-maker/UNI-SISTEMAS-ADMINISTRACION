using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface IShipmentService
{
    Task<ShipmentResponseDto> GetByTrackingCodeAsync(string trackingCode);
    Task<ShipmentResponseDto> GetByIdAsync(Guid id);
    Task<IEnumerable<ShipmentResponseDto>> GetAllAsync(string? estado = null, Guid? sedeId = null);
    Task<IEnumerable<ShipmentResponseDto>> GetMyShipmentsAsync(Guid clienteId);
    Task<ShipmentResponseDto> UpdateStatusAsync(Guid shipmentId, Guid empleadoId, UpdateShipmentStatusDto dto);
    Task<ShipmentResponseDto> DeliverShipmentAsync(Guid shipmentId, Guid empleadoId, string? notas);
}
