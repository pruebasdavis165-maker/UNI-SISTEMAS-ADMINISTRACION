using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class SedeService : ISedeService
{
    private readonly AppDbContext _context;

    public SedeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<SedeDto>> GetAllAsync(bool? activeOnly = null)
    {
        var query = _context.Sedes.AsNoTracking();

        if (activeOnly.HasValue && activeOnly.Value)
        {
            query = query.Where(s => s.Activo);
        }

        var sedes = await query
            .OrderBy(s => s.Nombre)
            .Select(s => new SedeDto(
                s.Id,
                s.Codigo,
                s.Nombre,
                s.Pais,
                s.Ciudad,
                s.DireccionVentanilla,
                s.TelefonoContacto,
                s.HorarioAtencion,
                s.Activo
            ))
            .ToListAsync();

        return sedes;
    }

    public async Task<SedeDto> GetByIdAsync(Guid id)
    {
        var s = await _context.Sedes.FindAsync(id);
        if (s == null)
            throw new KeyNotFoundException("Sede no encontrada.");

        return new SedeDto(
            s.Id,
            s.Codigo,
            s.Nombre,
            s.Pais,
            s.Ciudad,
            s.DireccionVentanilla,
            s.TelefonoContacto,
            s.HorarioAtencion,
            s.Activo
        );
    }
}
