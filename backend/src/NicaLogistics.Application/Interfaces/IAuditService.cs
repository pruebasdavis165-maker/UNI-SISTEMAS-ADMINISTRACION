using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(Guid? userId, string? userEmail, string accion, string modulo, string detalles, string? ipAddress);
    Task<IEnumerable<AuditLogDto>> GetLogsAsync(int limit = 50);
}
