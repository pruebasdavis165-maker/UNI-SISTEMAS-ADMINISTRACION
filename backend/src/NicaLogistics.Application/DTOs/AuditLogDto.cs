using NicaLogistics.Domain.Entities;

namespace NicaLogistics.Application.DTOs;

public record AuditLogDto(
    Guid Id,
    Guid? UsuarioId,
    string? UsuarioEmail,
    string Accion,
    string Modulo,
    string? Detalles,
    string? IpAddress,
    DateTime Fecha
);
