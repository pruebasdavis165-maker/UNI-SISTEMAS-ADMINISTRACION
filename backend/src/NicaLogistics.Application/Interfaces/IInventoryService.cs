using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface IInventoryService
{
    Task<IEnumerable<InventoryMovementDto>> GetMovementsAsync(Guid? productoId = null, int limit = 100);
    Task<InventoryMovementDto> RegisterMovementAsync(RegisterMovementDto dto, Guid? userId = null);
    Task<IEnumerable<InventoryAlertDto>> GetStockAlertsAsync();
}
