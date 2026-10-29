namespace NicaLogistics.Application.DTOs;

public record LoginRequestDto(string Email, string Password);

public record RegisterRequestDto(
    string NombreCompleto,
    string Email,
    string Password,
    string? Telefono,
    int? RolId
);

public record UserDto(
    Guid Id,
    string NombreCompleto,
    string Email,
    string? Telefono,
    string Rol,
    int RolId,
    bool Activo
);

public record AuthResponseDto(
    string Token,
    UserDto User
);

public record ForgotPasswordRequestDto(string Email);

public record ResetPasswordRequestDto(string Email, string Token, string NewPassword);
