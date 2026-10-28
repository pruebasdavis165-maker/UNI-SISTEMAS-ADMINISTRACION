using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _hasher;

    public UserService(AppDbContext context, IPasswordHasher hasher)
    {
        _context = context;
        _hasher = hasher;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync(string? search = null, int? rolId = null)
    {
        var query = _context.Usuarios
            .Include(u => u.Rol)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(u => u.NombreCompleto.ToLower().Contains(searchLower) || 
                                     u.Email.ToLower().Contains(searchLower));
        }

        if (rolId.HasValue && rolId.Value > 0)
        {
            query = query.Where(u => u.RolId == rolId.Value);
        }

        var users = await query
            .OrderBy(u => u.NombreCompleto)
            .Select(u => new UserDto(
                u.Id,
                u.NombreCompleto,
                u.Email,
                u.Telefono,
                u.Rol != null ? u.Rol.Nombre : "Cliente",
                u.RolId,
                u.Activo
            ))
            .ToListAsync();

        return users;
    }

    public async Task<UserDto> GetByIdAsync(Guid id)
    {
        var user = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado.");

        return new UserDto(
            user.Id,
            user.NombreCompleto,
            user.Email,
            user.Telefono,
            user.Rol?.Nombre ?? "Cliente",
            user.RolId,
            user.Activo
        );
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

        if (await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
        {
            throw new InvalidOperationException("Ya existe un usuario registrado con este correo electrónico.");
        }

        var role = await _context.Roles.FindAsync(dto.RolId)
            ?? throw new InvalidOperationException("El rol seleccionado no es válido.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            NombreCompleto = dto.NombreCompleto.Trim(),
            Email = normalizedEmail,
            PasswordHash = _hasher.HashPassword(dto.Password),
            Telefono = dto.Telefono?.Trim(),
            RolId = role.Id,
            Rol = role,
            Activo = true,
            CreadoEn = DateTime.UtcNow,
            ActualizadoEn = DateTime.UtcNow
        };

        _context.Usuarios.Add(user);
        await _context.SaveChangesAsync();

        return new UserDto(
            user.Id,
            user.NombreCompleto,
            user.Email,
            user.Telefono,
            role.Nombre,
            user.RolId,
            user.Activo
        );
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado.");

        var role = await _context.Roles.FindAsync(dto.RolId)
            ?? throw new InvalidOperationException("El rol seleccionado no es válido.");

        user.NombreCompleto = dto.NombreCompleto.Trim();
        user.Telefono = dto.Telefono?.Trim();
        user.RolId = role.Id;
        user.Rol = role;
        user.ActualizadoEn = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            user.PasswordHash = _hasher.HashPassword(dto.NewPassword);
        }

        await _context.SaveChangesAsync();

        return new UserDto(
            user.Id,
            user.NombreCompleto,
            user.Email,
            user.Telefono,
            role.Nombre,
            user.RolId,
            user.Activo
        );
    }

    public async Task<bool> ToggleStatusAsync(Guid id)
    {
        var user = await _context.Usuarios.FindAsync(id);
        if (user == null)
            throw new KeyNotFoundException("Usuario no encontrado.");

        user.Activo = !user.Activo;
        user.ActualizadoEn = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return user.Activo;
    }

    public async Task<IEnumerable<RoleDto>> GetRolesAsync()
    {
        return await _context.Roles
            .OrderBy(r => r.Id)
            .Select(r => new RoleDto(r.Id, r.Nombre, r.Descripcion))
            .ToListAsync();
    }
}
