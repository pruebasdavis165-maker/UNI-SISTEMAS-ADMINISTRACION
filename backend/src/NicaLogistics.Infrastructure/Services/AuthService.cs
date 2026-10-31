using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthService> _logger;

    // Almacenamiento concurrente en memoria para control de intentos fallidos y bloqueo temporal (Política 2)
    private static readonly ConcurrentDictionary<string, (int FailedAttempts, DateTime? LockoutUntil)> _loginAttempts = new();

    // Almacenamiento en memoria para tokens de recuperación de contraseña con expiración (15 min)
    private static readonly ConcurrentDictionary<string, (string Token, DateTime ExpiresAt)> _passwordResetTokens = new();

    // Registro pendiente de verificación (No se guarda en la base de datos hasta validar el código OTP)
    public record PendingRegistration(
        string NombreCompleto,
        string Email,
        string PasswordHash,
        string? Telefono,
        int RolId,
        string OtpCode,
        DateTime ExpiresAt
    );
    private static readonly ConcurrentDictionary<string, PendingRegistration> _pendingRegistrations = new();

    // Almacenamiento en memoria para códigos OTP de verificación de registro con expiración (15 min)
    private static readonly ConcurrentDictionary<string, (string Code, DateTime ExpiresAt)> _registrationOtps = new();

    public AuthService(
        AppDbContext context,
        IPasswordHasher hasher,
        IJwtTokenGenerator jwtGenerator,
        IEmailService emailService,
        ILogger<AuthService> logger)
    {
        _context = context;
        _hasher = hasher;
        _jwtGenerator = jwtGenerator;
        _emailService = emailService;
        _logger = logger;
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

        if (_pendingRegistrations.ContainsKey(normalizedEmail))
        {
            throw new UnauthorizedAccessException("Tu cuenta está pendiente de confirmación. Ingresa el código OTP enviado a tu correo para activarla.");
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

    public async Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        // 1. Validación estricta de Política 2 de Contraseñas (Issue 2.1)
        if (!PasswordPolicy.IsValid(request.Password, out var passwordError))
        {
            throw new InvalidOperationException(passwordError ?? PasswordPolicy.PolicyErrorMessage);
        }

        // Validación y normalización de Teléfono según política institucional
        string? normalizedPhone = null;
        if (!string.IsNullOrWhiteSpace(request.Telefono))
        {
            if (!PhonePolicy.IsValid(request.Telefono, out var phoneError, out normalizedPhone))
            {
                throw new InvalidOperationException(phoneError ?? PhonePolicy.PolicyErrorMessage);
            }
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

        var isClient = role.Nombre == "Cliente";
        var otpCode = Random.Shared.Next(100000, 999999).ToString();

        // Si es cliente, la cuenta NO se guarda en la base de datos hasta que el código OTP sea validado exitosamente
        if (isClient)
        {
            var pending = new PendingRegistration(
                NombreCompleto: request.NombreCompleto.Trim(),
                Email: normalizedEmail,
                PasswordHash: _hasher.HashPassword(request.Password),
                Telefono: normalizedPhone,
                RolId: role.Id,
                OtpCode: otpCode,
                ExpiresAt: DateTime.UtcNow.AddMinutes(15)
            );

            _pendingRegistrations[normalizedEmail] = pending;

            try
            {
                await _emailService.SendVerificationOtpEmailAsync(normalizedEmail, request.NombreCompleto.Trim(), otpCode);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar código OTP a {Email}", normalizedEmail);
            }

            return new RegisterResponseDto(
                RequiresVerification: true,
                Email: normalizedEmail,
                Message: "Hemos enviado un código de verificación de 6 dígitos a tu correo electrónico.",
                User: null
            );
        }

        // Para usuarios internos (administrador, vendedor, logística) creados internamente
        var user = new User
        {
            Id = Guid.NewGuid(),
            NombreCompleto = request.NombreCompleto.Trim(),
            Email = normalizedEmail,
            PasswordHash = _hasher.HashPassword(request.Password),
            Telefono = normalizedPhone,
            RolId = role.Id,
            Rol = role,
            Activo = true,
            CreadoEn = DateTime.UtcNow,
            ActualizadoEn = DateTime.UtcNow
        };

        _context.Usuarios.Add(user);
        await _context.SaveChangesAsync();

        var userDto = new UserDto(
            user.Id,
            user.NombreCompleto,
            user.Email,
            user.Telefono,
            role.Nombre,
            user.RolId,
            user.Activo
        );

        return new RegisterResponseDto(
            RequiresVerification: false,
            Email: user.Email,
            Message: "Usuario registrado exitosamente.",
            User: userDto
        );
    }

    public async Task<AuthResponseDto> VerifyOtpAsync(VerifyOtpRequestDto request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var code = request.OtpCode.Trim();

        // 1. Caso principal: Cuenta en estado pendiente de registro (no guardada aún en DB)
        if (_pendingRegistrations.TryGetValue(normalizedEmail, out var pending))
        {
            if (pending.ExpiresAt < DateTime.UtcNow)
            {
                _pendingRegistrations.TryRemove(normalizedEmail, out _);
                throw new InvalidOperationException("El código de verificación ha expirado. Por favor solicita uno nuevo.");
            }

            if (pending.OtpCode != code)
            {
                throw new InvalidOperationException("El código de verificación de 6 dígitos ingresado es incorrecto.");
            }

            // Validar que el correo no haya sido ocupado mientras tanto
            var alreadyExists = await _context.Usuarios.AnyAsync(u => u.Email.ToLower() == normalizedEmail);
            if (alreadyExists)
            {
                _pendingRegistrations.TryRemove(normalizedEmail, out _);
                throw new InvalidOperationException("El correo electrónico ya fue registrado previamente.");
            }

            var role = await _context.Roles.FindAsync(pending.RolId)
                ?? await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == "Cliente");

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                NombreCompleto = pending.NombreCompleto,
                Email = pending.Email,
                PasswordHash = pending.PasswordHash,
                Telefono = pending.Telefono,
                RolId = role?.Id ?? 4,
                Rol = role,
                Activo = true, // Se crea y activa definitivamente al validar el OTP
                CreadoEn = DateTime.UtcNow,
                ActualizadoEn = DateTime.UtcNow
            };

            _context.Usuarios.Add(newUser);
            await _context.SaveChangesAsync();

            // Consumir registro pendiente
            _pendingRegistrations.TryRemove(normalizedEmail, out _);

            var roleName = role?.Nombre ?? "Cliente";
            var token = _jwtGenerator.GenerateToken(newUser, roleName);

            var userDto = new UserDto(
                newUser.Id,
                newUser.NombreCompleto,
                newUser.Email,
                newUser.Telefono,
                roleName,
                newUser.RolId,
                newUser.Activo
            );

            return new AuthResponseDto(token, userDto);
        }

        // 2. Caso de respaldo: Usuarios existentes inactivos en base de datos
        if (_registrationOtps.TryGetValue(normalizedEmail, out var entry))
        {
            if (entry.ExpiresAt < DateTime.UtcNow)
            {
                throw new InvalidOperationException("El código de verificación ha expirado o no es válido. Por favor solicita uno nuevo.");
            }

            if (entry.Code != code)
            {
                throw new InvalidOperationException("El código de verificación de 6 dígitos ingresado es incorrecto.");
            }

            var user = await _context.Usuarios
                .Include(u => u.Rol)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (user == null)
                throw new KeyNotFoundException("Usuario no encontrado.");

            user.Activo = true;
            user.ActualizadoEn = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _registrationOtps.TryRemove(normalizedEmail, out _);

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

        throw new InvalidOperationException("No se encontró ninguna solicitud de verificación pendiente para este correo o el código ya expiró.");
    }

    public async Task<bool> ResendOtpAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        // 1. Caso de registro pendiente en memoria
        if (_pendingRegistrations.TryGetValue(normalizedEmail, out var pending))
        {
            var newOtp = Random.Shared.Next(100000, 999999).ToString();
            _pendingRegistrations[normalizedEmail] = pending with { OtpCode = newOtp, ExpiresAt = DateTime.UtcNow.AddMinutes(15) };

            try
            {
                await _emailService.SendVerificationOtpEmailAsync(normalizedEmail, pending.NombreCompleto, newOtp);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al reenviar código OTP a {Email}", normalizedEmail);
                return false;
            }
        }

        // 2. Caso de respaldo: Usuario inactivo en base de datos
        var user = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null) return false;

        var otpCode = Random.Shared.Next(100000, 999999).ToString();
        _registrationOtps[normalizedEmail] = (otpCode, DateTime.UtcNow.AddMinutes(15));

        try
        {
            await _emailService.SendVerificationOtpEmailAsync(user.Email, user.NombreCompleto, otpCode);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al reenviar código OTP a {Email}", user.Email);
            return false;
        }
    }

    public async Task<bool> RequestPasswordResetAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail && u.Activo);

        // Si el usuario no existe, devolvemos true genérico por seguridad (prevenir enumeración de cuentas)
        if (user == null)
        {
            return true;
        }

        var resetToken = $"{Random.Shared.Next(100000, 999999)}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        _passwordResetTokens[normalizedEmail] = (resetToken, DateTime.UtcNow.AddMinutes(15));

        _ = Task.Run(async () =>
        {
            try
            {
                await _emailService.SendPasswordResetEmailAsync(user.Email, user.NombreCompleto, resetToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al enviar correo de recuperación a {Email}", user.Email);
            }
        });

        return true;
    }

    public async Task<bool> ResetPasswordAsync(string email, string token, string newPassword)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        if (!_passwordResetTokens.TryGetValue(normalizedEmail, out var record) || 
            record.Token != token.Trim() || 
            record.ExpiresAt < DateTime.UtcNow)
        {
            throw new InvalidOperationException("El token de recuperación es inválido o ha expirado.");
        }

        if (!PasswordPolicy.IsValid(newPassword, out var passwordError))
        {
            throw new InvalidOperationException(passwordError ?? PasswordPolicy.PolicyErrorMessage);
        }

        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail && u.Activo);
        if (user == null)
        {
            throw new KeyNotFoundException("Usuario no encontrado.");
        }

        user.PasswordHash = _hasher.HashPassword(newPassword);
        user.ActualizadoEn = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _passwordResetTokens.TryRemove(normalizedEmail, out _);
        return true;
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
