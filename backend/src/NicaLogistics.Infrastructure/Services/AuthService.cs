using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.Common;
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

    // Almacenamiento concurrente en memoria para control de intentos fallidos y bloqueo temporal (Política 2)
    private static readonly ConcurrentDictionary<string, (int FailedAttempts, DateTime? LockoutUntil)> _loginAttempts = new();

    public AuthService(AppDbContext context, IPasswordHasher hasher, IJwtTokenGenerator jwtGenerator)
    {
        _context = context;
        _hasher = hasher;
        _jwtGenerator = jwtGenerator;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        // 1. Control de Bloqueo Temporal por 5 intentos fallidos (Política 2 / Issue 2.2)
        if (_loginAttempts.TryGetValue(normalizedEmail, out var attemptRecord))
        {
            if (attemptRecord.LockoutUntil.HasValue && attemptRecord.LockoutUntil.Value > DateTime.UtcNow)
            {
                var remainingMinutes = (int)Math.Ceiling((attemptRecord.LockoutUntil.Value - DateTime.UtcNow).TotalMinutes);
                throw new UnauthorizedAccessException($"Cuenta bloqueada temporalmente por seguridad tras 5 intentos fallidos (Política 2 de TI). Intente nuevamente en {remainingMinutes} minuto(s).");
            }
        }

        var user = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas: correo no registrado.");
        }

        if (!user.Activo)
        {
            throw new UnauthorizedAccessException("Cuenta suspendida o inactiva (Soft Delete). Contacte al administrador.");
        }

        var isPasswordValid = _hasher.VerifyPassword(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            // Registrar intento fallido
            var currentFailed = (_loginAttempts.TryGetValue(normalizedEmail, out var prev) ? prev.FailedAttempts : 0) + 1;
            
            if (currentFailed >= 5)
            {
                // Bloqueo temporal por 15 minutos (Política 2)
                _loginAttempts[normalizedEmail] = (currentFailed, DateTime.UtcNow.AddMinutes(15));
                throw new UnauthorizedAccessException("Cuenta bloqueada temporalmente durante 15 minutos debido a 5 intentos fallidos consecutivos de inicio de sesión (Política 2 de Seguridad).");
            }
            else
            {
                _loginAttempts[normalizedEmail] = (currentFailed, null);
                var remaining = 5 - currentFailed;
                throw new UnauthorizedAccessException($"Credenciales inválidas: contraseña incorrecta. Intentos restantes antes del bloqueo: {remaining}.");
            }
        }

        // Login exitoso: reiniciar contador de intentos fallidos
        _loginAttempts.TryRemove(normalizedEmail, out _);

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

        // 1. Validación estricta de Política 2 de Contraseñas (Issue 2.1)
        if (!PasswordPolicy.IsValid(request.Password, out var passwordError))
        {
            throw new InvalidOperationException(passwordError ?? PasswordPolicy.PolicyErrorMessage);
        }

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
