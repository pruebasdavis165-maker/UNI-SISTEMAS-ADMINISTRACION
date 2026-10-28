using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class CustomerService : ICustomerService
{
    private readonly AppDbContext _context;

    public CustomerService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CustomerSummaryDto>> GetCustomersAsync(string? search = null)
    {
        // Clientes tienen rol_id = 4 o nombre de rol 'Cliente'
        var query = _context.Usuarios
            .Include(u => u.Rol)
            .Where(u => u.RolId == 4 || (u.Rol != null && u.Rol.Nombre == "Cliente"))
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(u => u.NombreCompleto.ToLower().Contains(searchLower) ||
                                     u.Email.ToLower().Contains(searchLower) ||
                                     (u.Telefono != null && u.Telefono.Contains(searchLower)));
        }

        var customers = await query
            .OrderBy(u => u.NombreCompleto)
            .Select(u => new CustomerSummaryDto(
                u.Id,
                u.NombreCompleto,
                u.Email,
                u.Telefono,
                u.Activo,
                _context.Pedidos.Count(p => p.ClienteId == u.Id),
                _context.Pedidos.Where(p => p.ClienteId == u.Id && p.Estado != "CANCELADO").Sum(p => (decimal?)p.Total) ?? 0m,
                _context.Encomiendas.Count(e => e.ClienteId == u.Id),
                u.CreadoEn
            ))
            .ToListAsync();

        return customers;
    }

    public async Task<CustomerDetailDto> GetCustomerDetailAsync(Guid id)
    {
        var user = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            throw new KeyNotFoundException("Cliente no encontrado.");

        var orders = await _context.Pedidos
            .Include(p => p.SedeOrigen)
            .Include(p => p.SedeDestino)
            .Where(p => p.ClienteId == id)
            .OrderByDescending(p => p.CreadoEn)
            .Select(p => new CustomerOrderSummaryDto(
                p.Id,
                p.NumeroPedido,
                p.Total,
                p.Estado,
                p.SedeOrigen != null ? p.SedeOrigen.Nombre : "Miami Hub",
                p.SedeDestino != null ? p.SedeDestino.Nombre : "Sede Central",
                p.CreadoEn
            ))
            .ToListAsync();

        var shipments = await _context.Encomiendas
            .Include(e => e.SedeOrigen)
            .Include(e => e.SedeDestino)
            .Where(e => e.ClienteId == id)
            .OrderByDescending(e => e.FechaRegistro)
            .Select(e => new CustomerShipmentSummaryDto(
                e.Id,
                e.CodigoTracking,
                e.Estado,
                e.SedeOrigen != null ? e.SedeOrigen.Nombre : "Miami Hub",
                e.SedeDestino != null ? e.SedeDestino.Nombre : "Sede Central",
                e.FechaRegistro,
                e.FechaEntrega
            ))
            .ToListAsync();

        var totalSpent = orders.Where(o => o.Estado != "CANCELADO").Sum(o => o.Total);

        return new CustomerDetailDto(
            user.Id,
            user.NombreCompleto,
            user.Email,
            user.Telefono,
            user.Activo,
            user.CreadoEn,
            totalSpent,
            orders,
            shipments
        );
    }
}
