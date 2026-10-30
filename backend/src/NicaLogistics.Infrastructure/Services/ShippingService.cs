using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class ShippingService : IShippingService
{
    private readonly AppDbContext _context;

    public ShippingService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<FormaEnvioDto>> GetFormasEnvioAsync(bool? activeOnly = null)
    {
        var query = _context.FormasEnvio.AsNoTracking();
        if (activeOnly.HasValue && activeOnly.Value)
        {
            query = query.Where(f => f.Activo);
        }

        return await query
            .OrderBy(f => f.TipoRuta)
            .ThenBy(f => f.Nombre)
            .Select(f => new FormaEnvioDto(
                f.Id,
                f.Nombre,
                f.Codigo,
                f.TipoRuta,
                f.TarifaBase,
                f.TarifaPorLibra,
                f.TiempoEstimado,
                f.Descripcion,
                f.Activo
            ))
            .ToListAsync();
    }

    public async Task<FormaEnvioDto> GetFormaEnvioByIdAsync(Guid id)
    {
        var f = await _context.FormasEnvio.FindAsync(id);
        if (f == null) throw new KeyNotFoundException("Forma de envío no encontrada.");

        return new FormaEnvioDto(
            f.Id,
            f.Nombre,
            f.Codigo,
            f.TipoRuta,
            f.TarifaBase,
            f.TarifaPorLibra,
            f.TiempoEstimado,
            f.Descripcion,
            f.Activo
        );
    }

    public async Task<FormaEnvioDto> CreateFormaEnvioAsync(CreateFormaEnvioDto dto)
    {
        var normalizedCode = dto.Codigo.Trim().ToUpperInvariant();
        if (await _context.FormasEnvio.AnyAsync(f => f.Codigo == normalizedCode))
        {
            throw new InvalidOperationException("Ya existe una forma de envío con este código.");
        }

        var forma = new FormaEnvio
        {
            Nombre = dto.Nombre.Trim(),
            Codigo = normalizedCode,
            TipoRuta = dto.TipoRuta.Trim().ToUpperInvariant(),
            TarifaBase = Math.Max(0, dto.TarifaBase),
            TarifaPorLibra = Math.Max(0, dto.TarifaPorLibra),
            TiempoEstimado = dto.TiempoEstimado.Trim(),
            Descripcion = dto.Descripcion?.Trim(),
            Activo = true,
            CreadoEn = DateTime.UtcNow,
            ActualizadoEn = DateTime.UtcNow
        };

        _context.FormasEnvio.Add(forma);
        await _context.SaveChangesAsync();

        return new FormaEnvioDto(
            forma.Id,
            forma.Nombre,
            forma.Codigo,
            forma.TipoRuta,
            forma.TarifaBase,
            forma.TarifaPorLibra,
            forma.TiempoEstimado,
            forma.Descripcion,
            forma.Activo
        );
    }

    public async Task<FormaEnvioDto> UpdateFormaEnvioAsync(Guid id, UpdateFormaEnvioDto dto)
    {
        var forma = await _context.FormasEnvio.FindAsync(id);
        if (forma == null) throw new KeyNotFoundException("Forma de envío no encontrada.");

        forma.Nombre = dto.Nombre.Trim();
        forma.TarifaBase = Math.Max(0, dto.TarifaBase);
        forma.TarifaPorLibra = Math.Max(0, dto.TarifaPorLibra);
        forma.TiempoEstimado = dto.TiempoEstimado.Trim();
        forma.Descripcion = dto.Descripcion?.Trim();
        forma.Activo = dto.Activo;
        forma.ActualizadoEn = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new FormaEnvioDto(
            forma.Id,
            forma.Nombre,
            forma.Codigo,
            forma.TipoRuta,
            forma.TarifaBase,
            forma.TarifaPorLibra,
            forma.TiempoEstimado,
            forma.Descripcion,
            forma.Activo
        );
    }

    public async Task<IEnumerable<OpcionEnvioDto>> CotizarRutaAsync(CotizarEnvioRequestDto request)
    {
        var sedeOrigen = await _context.Sedes.FirstOrDefaultAsync(s => s.Id == request.SedeOrigenId && s.Activo)
            ?? throw new KeyNotFoundException("Sede de origen no encontrada o inactiva.");

        var sedeDestino = request.SedeOrigenId == request.SedeDestinoId
            ? sedeOrigen
            : await _context.Sedes.FirstOrDefaultAsync(s => s.Id == request.SedeDestinoId && s.Activo)
                ?? throw new KeyNotFoundException("Sede de destino no encontrada o inactiva.");

        var peso = Math.Max(0.5m, request.PesoTotalLibras);
        var opciones = new List<OpcionEnvioDto>();

        // 1. Pickup Local (Origen === Destino)
        if (sedeOrigen.Id == sedeDestino.Id)
        {
            opciones.Add(new OpcionEnvioDto(
                Modalidad: "Pickup en Ventanilla (Local)",
                Codigo: "PICKUP_LOCAL",
                Costo: 0.00m,
                TiempoEstimado: "Disponible inmediatamente",
                TipoRuta: "LOCAL",
                Descripcion: $"Retiro directo en la ventanilla oficial de {sedeDestino.Nombre} sin cargos de traslado logístico."
            ));
            return opciones;
        }

        var paisOrigen = sedeOrigen.Pais.Trim().ToLowerInvariant();
        var paisDestino = sedeDestino.Pais.Trim().ToLowerInvariant();

        // 2. Rutas Nacionales (Ambas sedes en Nicaragua)
        if (paisOrigen == "nicaragua" && paisDestino == "nicaragua")
        {
            var terrestre = await _context.FormasEnvio
                .FirstOrDefaultAsync(f => f.Codigo == "TERRESTRE_NAC" && f.Activo);

            var tarifaBase = terrestre?.TarifaBase ?? 3.00m;
            var tarifaPorLibra = terrestre?.TarifaPorLibra ?? 0.75m;
            var costoTotal = Math.Round(tarifaBase + (peso * tarifaPorLibra), 2);

            opciones.Add(new OpcionEnvioDto(
                Modalidad: terrestre?.Nombre ?? "Terrestre Estándar",
                Codigo: "TERRESTRE_NAC",
                Costo: costoTotal,
                TiempoEstimado: terrestre?.TiempoEstimado ?? "24 - 48 horas hábiles",
                TipoRuta: "NACIONAL",
                Descripcion: terrestre?.Descripcion ?? $"Despacho terrestre intermunicipal seguro entre {sedeOrigen.Ciudad} y {sedeDestino.Ciudad} ({peso:F1} lbs)."
            ));

            return opciones;
        }

        // 3. Rutas Internacionales (Nicaragua <-> Estados Unidos)
        var formasInt = await _context.FormasEnvio
            .Where(f => f.TipoRuta == "INTERNACIONAL" && f.Activo)
            .OrderBy(f => f.TarifaBase)
            .ToListAsync();

        if (!formasInt.Any())
        {
            // Fallback por defecto si no están sembradas
            var costoMaritimo = Math.Round(10.00m + (peso * 1.85m), 2);
            var costoAereo = Math.Round(20.00m + (peso * 4.50m), 2);

            opciones.Add(new OpcionEnvioDto(
                Modalidad: "Marítimo Económico",
                Codigo: "MARITIMO_INT",
                Costo: costoMaritimo,
                TiempoEstimado: "10 - 15 días hábiles",
                TipoRuta: "INTERNACIONAL",
                Descripcion: $"Carga marítima consolidada bilateral {sedeOrigen.Ciudad} ⇄ {sedeDestino.Ciudad} ({peso:F1} lbs)."
            ));

            opciones.Add(new OpcionEnvioDto(
                Modalidad: "Aéreo Exprés",
                Codigo: "AEREO_INT",
                Costo: costoAereo,
                TiempoEstimado: "2 - 4 días hábiles",
                TipoRuta: "INTERNACIONAL",
                Descripcion: $"Vuelo exprés prioritario bilateral con trámite aduanal y entrega rápida en ventanilla ({peso:F1} lbs)."
            ));

            return opciones;
        }

        foreach (var f in formasInt)
        {
            var costo = Math.Round(f.TarifaBase + (peso * f.TarifaPorLibra), 2);
            opciones.Add(new OpcionEnvioDto(
                Modalidad: f.Nombre,
                Codigo: f.Codigo,
                Costo: costo,
                TiempoEstimado: f.TiempoEstimado,
                TipoRuta: "INTERNACIONAL",
                Descripcion: f.Descripcion ?? $"Transporte {f.Nombre} bilateral ({peso:F1} lbs)."
            ));
        }

        return opciones;
    }
}
