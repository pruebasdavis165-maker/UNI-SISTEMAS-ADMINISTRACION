using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;

namespace NicaLogistics.Infrastructure.Data;

/// <summary>
/// Inicializador y sembrador formal de base de datos para NicaLogistics.
/// Garantiza la existencia de roles del sistema, sedes oficiales y los 4 usuarios
/// de inicio rápido (Demo) con contraseñas seguras cifradas con BCrypt (Política 2 y 6).
/// </summary>
public static class DbInitializer
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        try
        {
            // 1. Garantizar Roles del Sistema
            var roles = new List<Role>
            {
                new() { Id = 1, Nombre = "Admin", Descripcion = "Administrador general del sistema con control total y auditoría" },
                new() { Id = 2, Nombre = "Vendedor", Descripcion = "Gestión de clientes, catálogo, ventas y seguimiento comercial" },
                new() { Id = 3, Nombre = "Logística", Descripcion = "Control de almacén, recepción, tránsito y entrega en ventanilla" },
                new() { Id = 4, Nombre = "Cliente", Descripcion = "Consulta de catálogo, checkout Sede a Sede y rastreo de encomiendas" }
            };

            foreach (var role in roles)
            {
                var existingRole = await context.Roles.FindAsync(role.Id);
                if (existingRole == null)
                {
                    context.Roles.Add(role);
                }
                else
                {
                    existingRole.Nombre = role.Nombre;
                    existingRole.Descripcion = role.Descripcion;
                }
            }
            await context.SaveChangesAsync();

            // 2. Garantizar Sedes Oficiales (Sede a Sede exclusivo Miami Hub y Managua)
            var sedes = new List<Sede>
            {
                new()
                {
                    Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                    Codigo = "MIA-01",
                    Nombre = "Sede Central Miami Hub",
                    Pais = "Estados Unidos",
                    Ciudad = "Miami",
                    DireccionVentanilla = "8400 NW 25th St, Doral, FL 33198 (Ventanilla de Carga y Recepción)",
                    TelefonoContacto = "+1 (305) 555-0199",
                    HorarioAtencion = "Lun - Vie: 8:00 AM - 5:00 PM",
                    Activo = true
                },
                new()
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    Codigo = "MGA-01",
                    Nombre = "Sede Central Managua",
                    Pais = "Nicaragua",
                    Ciudad = "Managua",
                    DireccionVentanilla = "Km 4.5 Carretera Norte, Frente a Enabas (Ventanilla Principal)",
                    TelefonoContacto = "+505 2249-0100",
                    HorarioAtencion = "Lun - Sáb: 8:00 AM - 6:00 PM",
                    Activo = true
                }
            };

            foreach (var sede in sedes)
            {
                var existingSede = await context.Sedes.FirstOrDefaultAsync(s => s.Codigo == sede.Codigo);
                if (existingSede == null)
                {
                    context.Sedes.Add(sede);
                }
                else
                {
                    existingSede.Nombre = sede.Nombre;
                    existingSede.DireccionVentanilla = sede.DireccionVentanilla;
                    existingSede.Activo = true;
                }
            }
            await context.SaveChangesAsync();

            // 3. Garantizar los 4 Usuarios de Inicio Rápido (Demo) con Passwords Bcrypt
            var demoUsers = new List<(Guid Id, string Nombre, string Email, string RawPassword, string Telefono, int RolId)>
            {
                (
                    Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                    "Administrador General NicaLogistics",
                    "davismunoz165@gmail.com",
                    "Admin123*!",
                    "+505 8888-0001",
                    1 // Admin
                ),
                (
                    Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                    "Carlos Mendoza - Vendedor Comercial",
                    "vendedor@nicalogistics.com",
                    "Vendedor123*!",
                    "+505 8888-0002",
                    2 // Vendedor
                ),
                (
                    Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                    "Roberto Silva - Operador Logístico",
                    "logistica@nicalogistics.com",
                    "Logistica123*!",
                    "+505 8888-0003",
                    3 // Logística
                ),
                (
                    Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                    "Alejandro Morales (Cliente Frecuente)",
                    "cliente@gmail.com",
                    "Cliente123*!",
                    "+505 8888-0004",
                    4 // Cliente
                )
            };

            foreach (var (id, nombre, email, rawPassword, telefono, rolId) in demoUsers)
            {
                var normEmail = email.Trim().ToLowerInvariant();
                var user = await context.Usuarios.FirstOrDefaultAsync(u => u.Email.ToLower() == normEmail);

                if (user == null)
                {
                    user = new User
                    {
                        Id = id,
                        NombreCompleto = nombre,
                        Email = normEmail,
                        PasswordHash = hasher.HashPassword(rawPassword),
                        Telefono = telefono,
                        RolId = rolId,
                        Activo = true,
                        CreadoEn = DateTime.UtcNow,
                        ActualizadoEn = DateTime.UtcNow
                    };
                    context.Usuarios.Add(user);
                    logger.LogInformation("[DbInitializer] Usuario demo creado: {Email} (Rol ID: {RolId})", normEmail, rolId);
                }
                else
                {
                    // Si ya existe, verificar que la contraseña sea válida con Bcrypt; si no, actualizar el hash
                    var isValid = hasher.VerifyPassword(rawPassword, user.PasswordHash);
                    if (!isValid)
                    {
                        user.PasswordHash = hasher.HashPassword(rawPassword);
                        logger.LogInformation("[DbInitializer] Contraseña sincronizada para usuario demo: {Email}", normEmail);
                    }
                    user.RolId = rolId;
                    user.Activo = true;
                }
            }

            await context.SaveChangesAsync();
            logger.LogInformation("[DbInitializer] Inicialización de usuarios de prueba completada exitosamente.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[DbInitializer] Error durante la inicialización de datos de semilla en la base de datos.");
        }
    }
}
