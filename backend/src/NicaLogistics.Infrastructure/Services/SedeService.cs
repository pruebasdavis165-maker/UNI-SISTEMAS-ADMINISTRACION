using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;
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

    public async Task<SedeDto> CreateAsync(CreateSedeDto dto)
    {
        var sede = new Sede
        {
            Id = Guid.NewGuid(),
            Codigo = dto.Codigo.Trim().ToUpper(),
            Nombre = dto.Nombre.Trim(),
            Pais = dto.Pais.Trim(),
            Ciudad = dto.Ciudad.Trim(),
            DireccionVentanilla = dto.DireccionVentanilla.Trim(),
            TelefonoContacto = dto.TelefonoContacto?.Trim(),
            HorarioAtencion = dto.HorarioAtencion?.Trim(),
            Activo = true,
            CreadoEn = DateTime.UtcNow
        };

        _context.Sedes.Add(sede);
        await _context.SaveChangesAsync();

        return new SedeDto(
            sede.Id, sede.Codigo, sede.Nombre, sede.Pais, sede.Ciudad,
            sede.DireccionVentanilla, sede.TelefonoContacto, sede.HorarioAtencion, sede.Activo
        );
    }

    public async Task<SedeDto> UpdateAsync(Guid id, UpdateSedeDto dto)
    {
        var sede = await _context.Sedes.FindAsync(id);
        if (sede == null)
            throw new KeyNotFoundException("Sede no encontrada.");

        sede.Nombre = dto.Nombre.Trim();
        sede.Pais = dto.Pais.Trim();
        sede.Ciudad = dto.Ciudad.Trim();
        sede.DireccionVentanilla = dto.DireccionVentanilla.Trim();
        sede.TelefonoContacto = dto.TelefonoContacto?.Trim();
        sede.HorarioAtencion = dto.HorarioAtencion?.Trim();
        sede.Activo = dto.Activo;

        await _context.SaveChangesAsync();

        return new SedeDto(
            sede.Id, sede.Codigo, sede.Nombre, sede.Pais, sede.Ciudad,
            sede.DireccionVentanilla, sede.TelefonoContacto, sede.HorarioAtencion, sede.Activo
        );
    }

    public async Task<bool> ToggleStatusAsync(Guid id)
    {
        var sede = await _context.Sedes.FindAsync(id);
        if (sede == null)
            throw new KeyNotFoundException("Sede no encontrada.");

        sede.Activo = !sede.Activo;
        await _context.SaveChangesAsync();
        return sede.Activo;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var sede = await _context.Sedes.FindAsync(id);
        if (sede == null)
            throw new KeyNotFoundException("Sede no encontrada.");

        // Verificar si la sede tiene encomiendas o pedidos vinculados
        var hasEncomiendas = await _context.Encomiendas.AnyAsync(e => e.SedeOrigenId == id || e.SedeDestinoId == id);
        var hasPedidos = await _context.Pedidos.AnyAsync(p => p.SedeOrigenId == id || p.SedeDestinoId == id);

        if (hasEncomiendas || hasPedidos)
        {
            // Si tiene registros históricos o activos, se desactiva para mantener la integridad referencial
            sede.Activo = false;
            await _context.SaveChangesAsync();
            return false;
        }

        // Eliminación física directa de la tabla sedes en PostgreSQL
        _context.Sedes.Remove(sede);
        await _context.SaveChangesAsync();
        return true;
    }
}
