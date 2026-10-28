namespace NicaLogistics.Application.DTOs;

public record CreateUserDto(
    string NombreCompleto,
    string Email,
    string Password,
    string? Telefono,
    int RolId
);

public record UpdateUserDto(
    string NombreCompleto,
    string? Telefono,
    int RolId,
    string? NewPassword
);

public record RoleDto(
    int Id,
    string Nombre,
    string? Descripcion
);
