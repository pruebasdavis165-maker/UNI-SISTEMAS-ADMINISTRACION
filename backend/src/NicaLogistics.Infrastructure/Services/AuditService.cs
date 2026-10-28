using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly AppDbContext _context;

    public AuditService(AppDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(Guid? userId, string? userEmail, string accion, string modulo, string detalles, string? ipAddress)
    {
        var log = new AuditLog
        {
            Id = Guid.NewGuid(),
            UsuarioId = userId,
            UsuarioEmail = userEmail,
            Accion = accion,
            Modulo = modulo,
            Detalles = detalles,
            IpAddress = ipAddress,
            Fecha = DateTime.UtcNow
        };

        _context.LogsAuditoria.Add(log);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<AuditLogDto>> GetLogsAsync(int limit = 50)
    {
        var logs = await _context.LogsAuditoria
            .OrderByDescending(l => l.Fecha)
            .Take(limit)
            .Select(l => new AuditLogDto(
                l.Id,
                l.UsuarioId,
                l.UsuarioEmail,
                l.Accion,
                l.Modulo,
                l.Detalles,
                l.IpAddress,
                l.Fecha
            ))
            .ToListAsync();

        return logs;
    }
}
