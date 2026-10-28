using System.Security.Claims;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Api.Middlewares;

public class AuditLoggingMiddleware
{
    private readonly RequestDelegate _next;

    public AuditLoggingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IAuditService auditService)
    {
        var method = context.Request.Method;
        var path = context.Request.Path.Value ?? "";

        // Ejecutar la petición
        await _next(context);

        // Auditar solo métodos que modifican estado (POST, PUT, DELETE, PATCH)
        if (method == HttpMethods.Post || method == HttpMethods.Put || method == HttpMethods.Delete || method == HttpMethods.Patch)
        {
            try
            {
                var userIdStr = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                Guid? userId = Guid.TryParse(userIdStr, out var parsedId) ? parsedId : null;
                var userEmail = context.User.FindFirstValue(ClaimTypes.Email) ?? "Anónimo";

                // Determinar el módulo a partir de la ruta
                var modulo = "Sistema";
                if (path.Contains("/api/auth", StringComparison.OrdinalIgnoreCase)) modulo = "Autenticación";
                else if (path.Contains("/api/usuarios", StringComparison.OrdinalIgnoreCase)) modulo = "Usuarios";
                else if (path.Contains("/api/productos", StringComparison.OrdinalIgnoreCase)) modulo = "Productos";
                else if (path.Contains("/api/categorias", StringComparison.OrdinalIgnoreCase)) modulo = "Categorías";
                else if (path.Contains("/api/inventario", StringComparison.OrdinalIgnoreCase)) modulo = "Inventario";
                else if (path.Contains("/api/pedidos", StringComparison.OrdinalIgnoreCase)) modulo = "Pedidos";
                else if (path.Contains("/api/tracking", StringComparison.OrdinalIgnoreCase)) modulo = "Tracking";
                else if (path.Contains("/api/encomiendas", StringComparison.OrdinalIgnoreCase)) modulo = "Encomiendas";

                var ipAddress = context.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                var detalles = $"{method} {path} - Status: {context.Response.StatusCode}";

                await auditService.LogAsync(userId, userEmail, method, modulo, detalles, ipAddress);
            }
            catch (Exception ex)
            {
                // El registro de auditoría no debe romper la respuesta al usuario
                Console.Error.WriteLine($"[AuditLoggingError] {ex.Message}");
            }
        }
    }
}
