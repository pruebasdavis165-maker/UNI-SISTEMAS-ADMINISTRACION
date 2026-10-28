using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenGenerator _jwtGenerator;

    public AuthService(AppDbContext context, IPasswordHasher hasher, IJwtTokenGenerator jwtGenerator)
    {
        _context = context;
        _hasher = hasher;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var user = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas: correo no registrado.");
        }

        if (!user.Activo)
        {
            throw new UnauthorizedAccessException("Cuenta suspendida o inactiva. Contacte al administrador.");
        }

        var isPasswordValid = _hasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas: contraseña incorrecta.");
        }

        var roleName = user.Rol?.Nombre ?? "Cliente";
        var token = _jwtGenerator.GenerateToken(user, roleName);

        var userDto = new UserDto(
            user.Id,
            user.NombreCompleto,
            user.Email,
            user.Telefono,
            roleName,
            user.RolId,
            user.Activo
        );

        return new AuthResponseDto(token, userDto);
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        var emailExists = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == normalizedEmail);
        if (emailExists)
        {
            throw new InvalidOperationException("El correo electrónico ya se encuentra registrado.");
        }

        // Por defecto rol Cliente (id = 4)
        var rolId = request.RolId ?? 4;
        var role = await _context.Roles.FindAsync(rolId)
            ?? await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == "Cliente");

        if (role == null)
        {
            role = new Role { Id = 4, Nombre = "Cliente", Descripcion = "Cliente de la plataforma" };
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            NombreCompleto = request.NombreCompleto.Trim(),
            Email = normalizedEmail,
            PasswordHash = _hasher.HashPassword(request.Password),
            Telefono = request.Telefono?.Trim(),
            RolId = role.Id,
            Rol = role,
            Activo = true,
            CreadoEn = DateTime.UtcNow,
            ActualizadoEn = DateTime.UtcNow
        };

        _context.Usuarios.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtGenerator.GenerateToken(user, role.Nombre);

        var userDto = new UserDto(
            user.Id,
            user.NombreCompleto,
            user.Email,
            user.Telefono,
            role.Nombre,
            user.RolId,
            user.Activo
        );

        return new AuthResponseDto(token, userDto);
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId)
    {
        var user = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            throw new KeyNotFoundException("Usuario no encontrado.");
        }

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
}
