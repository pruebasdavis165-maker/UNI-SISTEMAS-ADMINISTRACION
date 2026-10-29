using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Infrastructure.Services;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ResendEmailService> _logger;
    private readonly string _apiKey;
    private readonly string _fromEmail;
    private readonly string _adminEmail;

    public ResendEmailService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ResendEmailService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;

        _apiKey = _configuration["Resend:ApiKey"] 
            ?? Environment.GetEnvironmentVariable("RESEND_API_KEY") 
            ?? string.Empty;

        _fromEmail = _configuration["Resend:FromEmail"] 
            ?? Environment.GetEnvironmentVariable("RESEND_FROM_EMAIL") 
            ?? "NicaLogistics <onboarding@resend.dev>";

        _adminEmail = _configuration["Resend:AdminEmail"] 
            ?? Environment.GetEnvironmentVariable("RESEND_ADMIN_EMAIL") 
            ?? "admin@nicalogistics.com";
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string htmlContent)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(_apiKey))
            {
                _logger.LogWarning("[ResendEmailService] No se ha configurado API Key para Resend. Simulando envío a {To}", to);
                return true;
            }

            var payload = new
            {
                from = _fromEmail,
                to = new[] { to },
                subject = subject,
                html = htmlContent
            };

            var json = JsonSerializer.Serialize(payload);
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

            var response = await _httpClient.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("[ResendEmailService] Correo enviado exitosamente a {To}. Respuesta: {Response}", to, responseBody);
                return true;
            }

            _logger.LogWarning("[ResendEmailService] Resend API devolvió estado {StatusCode}: {ResponseBody}", response.StatusCode, responseBody);

            // Manejo automático del Sandbox de Resend:
            // En cuentas gratuitas/sandbox sin dominio corporativo verificado, Resend solo permite enviar al correo del propietario (davismunoz05@gmail.com).
            // Si el destinatario no está verificado en Resend, redirigimos automáticamente a la bandeja verificada del usuario para que SIEMPRE reciba la prueba en su Gmail real.
            if (responseBody.Contains("You can only send testing emails to your own email address") || response.StatusCode == System.Net.HttpStatusCode.Forbidden)
            {
                var match = System.Text.RegularExpressions.Regex.Match(responseBody, @"\(([^)]+@[^)]+)\)");
                var verifiedOwner = match.Success ? match.Groups[1].Value : "davismunoz05@gmail.com";

                _logger.LogInformation("[Resend Sandbox Delivery] Redirigiendo a la bandeja verificada {Owner} para destinatario {To}", verifiedOwner, to);

                var banner = $"""
                <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 13px; color: #92400e;">
                  <strong>⚡ Notificación de Modo Pruebas (Resend Sandbox):</strong> Este correo transaccional fue generado en el sistema para el cliente <strong>{to}</strong> y entregado a tu bandeja verificada (<strong>{verifiedOwner}</strong>) para validación en tiempo real.
                </div>
                """;

                var retryPayload = new
                {
                    from = _fromEmail,
                    to = new[] { verifiedOwner },
                    subject = $"[Prueba NicaLogistics -> {to}] {subject}",
                    html = banner + htmlContent
                };

                var retryJson = JsonSerializer.Serialize(retryPayload);
                using var retryRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
                {
                    Content = new StringContent(retryJson, Encoding.UTF8, "application/json")
                };
                retryRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);

                var retryResponse = await _httpClient.SendAsync(retryRequest);
                var retryBody = await retryResponse.Content.ReadAsStringAsync();

                if (retryResponse.IsSuccessStatusCode)
                {
                    _logger.LogInformation("[ResendEmailService] Correo sandbox entregado exitosamente en bandeja real {Owner}. Respuesta: {Response}", verifiedOwner, retryBody);
                    return true;
                }
                else
                {
                    _logger.LogWarning("[ResendEmailService] Error en reintento a bandeja verificada: {RetryBody}", retryBody);
                }
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[ResendEmailService] Error inesperado al enviar correo a {To}", to);
            // No interrumpimos la operación del negocio por fallas transaccionales de red
            return false;
        }
    }

    public async Task<bool> SendVerificationOtpEmailAsync(string to, string clientName, string otpCode)
    {
        var subject = $"Tu código de verificación NicaLogistics: {otpCode}";
        var html = $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/></head>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1a56db; margin: 0; font-size: 24px; font-weight: 800;">NICALOGISTICS</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Plataforma Enterprise Sede a Sede</p>
            </div>
            <h3 style="color: #0f172a; font-size: 18px; margin-bottom: 12px;">¡Hola, {clientName}!</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Gracias por registrarte en NicaLogistics. Para verificar tu cuenta y garantizar la seguridad de tus encomiendas internacionales, ingresa el siguiente código de un solo uso (OTP):
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1a56db; background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 24px; rounded: 12px; border-radius: 12px;">
                {otpCode}
              </span>
            </div>
            <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
              Este código es confidencial y vence en 15 minutos. Si no solicitaste este registro, puedes ignorar este mensaje con seguridad.
            </p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
            <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
              © {DateTime.UtcNow.Year} NicaLogistics. Operaciones bilaterales Miami Hub ⇄ Managua.
            </p>
          </div>
        </body>
        </html>
        """;

        return await SendEmailAsync(to, subject, html);
    }

    public async Task<bool> SendPasswordResetEmailAsync(string to, string clientName, string resetTokenOrLink)
    {
        var subject = "Recuperación de contraseña de tu cuenta NicaLogistics";
        var html = $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/></head>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #1a56db; margin: 0; font-size: 24px; font-weight: 800;">NICALOGISTICS</h2>
              <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Seguridad de Cuentas y Accesos</p>
            </div>
            <h3 style="color: #0f172a; font-size: 18px; margin-bottom: 12px;">Estimado/a {clientName},</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta corporativa. Utiliza el siguiente token de seguridad:
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <div style="display: inline-block; font-family: monospace; font-size: 18px; font-weight: 700; color: #1e293b; background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px 20px; border-radius: 8px;">
                {resetTokenOrLink}
              </div>
            </div>
            <p style="font-size: 13px; color: #475569; line-height: 1.5;">
              Por políticas de ciberseguridad, tu nueva contraseña debe contener al menos 8 caracteres, mayúscula, minúscula, número y un carácter especial.
            </p>
            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
            <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
              Si no solicitaste este cambio, reporta este evento de inmediato a soporte@nicalogistics.com.
            </p>
          </div>
        </body>
        </html>
        """;

        return await SendEmailAsync(to, subject, html);
    }

    public async Task<bool> SendOrderReceiptEmailAsync(
        string to,
        string clientName,
        string orderNumber,
        string trackingCode,
        decimal total,
        string sedeOrigen,
        string sedeDestino,
        IEnumerable<(string ProductName, int Quantity, decimal Subtotal)> items)
    {
        var subject = $"Recibo de Compra #{orderNumber} - Tracking: {trackingCode}";

        var itemsRows = new StringBuilder();
        foreach (var item in items)
        {
            itemsRows.Append($"""
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b;">{item.ProductName}</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 13px; color: #475569;">{item.Quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 13px; font-weight: 700; color: #1a56db;">${item.Subtotal:F2}</td>
            </tr>
            """);
        }

        var html = $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/></head>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                ✓ Pago Confirmado Exitosamente
              </span>
              <h2 style="color: #1a56db; margin: 12px 0 4px; font-size: 24px; font-weight: 800;">NICALOGISTICS</h2>
              <p style="color: #64748b; font-size: 14px; margin: 0;">Recibo de Pedido #{orderNumber}</p>
            </div>

            <p style="font-size: 14px; color: #334155; margin-bottom: 20px;">
              Estimado/a <strong>{clientName}</strong>, tu pago ha sido procesado atómicamente y tu encomienda ha sido generada en el circuito Sede a Sede.
            </p>

            <!-- Tracking Box Grande en Blanco Corporativo -->
            <div style="background: #f8fafc; border: 2px dashed #bfdbfe; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">Código de Rastreo Oficial</span>
              <div style="font-family: monospace; font-size: 30px; font-weight: 800; color: #1a56db; margin-top: 6px; letter-spacing: 2px;">
                {trackingCode}
              </div>
              <p style="font-size: 11px; color: #64748b; margin: 6px 0 0;">
                Conserva este código. Es obligatorio presentarlo físicamente junto a tu cédula en ventanilla.
              </p>
            </div>

            <!-- Ruta Logística Sede a Sede -->
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 10px; padding: 14px; margin-bottom: 20px;">
              <div style="width: 48%;">
                <span style="font-size: 10px; font-weight: 700; color: #1e40af; text-transform: uppercase; display: block;">Sede Origen (Despacho)</span>
                <strong style="font-size: 12px; color: #1e293b;">{sedeOrigen}</strong>
              </div>
              <div style="width: 48%; text-align: right;">
                <span style="font-size: 10px; font-weight: 700; color: #047857; text-transform: uppercase; display: block;">Sede Destino (Pickup)</span>
                <strong style="font-size: 12px; color: #064e3b;">{sedeDestino}</strong>
              </div>
            </div>

            <!-- Tabla de Productos -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                  <th style="padding: 10px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase;">Producto Facturado</th>
                  <th style="padding: 10px; text-align: center; font-size: 11px; color: #64748b; text-transform: uppercase;">Cant.</th>
                  <th style="padding: 10px; text-align: right; font-size: 11px; color: #64748b; text-transform: uppercase;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {itemsRows}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: 700; font-size: 14px; color: #1e293b;">Total Facturado:</td>
                  <td style="padding: 12px 10px; text-align: right; font-weight: 800; font-size: 16px; color: #1a56db;">${total:F2} USD</td>
                </tr>
              </tfoot>
            </table>

            <!-- Instrucciones Obligatorias para Retiro en Ventanilla -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                📋 Requisitos Obligatorios para Retiro en Ventanilla Oficial
              </h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #334155; line-height: 1.6;">
                <li>Presentar documento de identidad original oficial (<strong>Cédula de Identidad de Nicaragua o Pasaporte Oficial vigente</strong>).</li>
                <li>Presentar el <strong>Código de Rastreo Oficial ({trackingCode})</strong> en pantalla de tu móvil o comprobante impreso.</li>
                <li>El retiro debe realizarse estrictamente en la sucursal de destino autorizada: <strong>{sedeDestino}</strong>.</li>
                <li>En caso de retiro por una tercera persona autorizada, deberá presentar carta poder firmada y fotocopia de la cédula del titular de la cuenta.</li>
              </ul>
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
            <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
              NicaLogistics S.A. • Operaciones bilaterales Miami Hub y Managua Central • Cero envíos a domicilio.
            </p>
          </div>
        </body>
        </html>
        """;

        return await SendEmailAsync(to, subject, html);
    }

    public async Task<bool> SendReadyForPickupEmailAsync(
        string to,
        string clientName,
        string trackingCode,
        string sedeDestinoNombre,
        string sedeDestinoDireccion,
        string? horarioAtencion)
    {
        var subject = $"¡Tu encomienda {trackingCode} está lista para retiro en ventanilla!";
        var html = $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/></head>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                📦 Lista para Retiro en Ventanilla
              </span>
              <h2 style="color: #1a56db; margin: 12px 0 4px; font-size: 24px; font-weight: 800;">NICALOGISTICS</h2>
              <p style="color: #64748b; font-size: 13px; margin: 0;">Aviso Oficial de Llegada a Sede</p>
            </div>

            <h3 style="color: #0f172a; font-size: 17px; margin-bottom: 12px;">¡Buenas noticias, {clientName}!</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Tu encomienda con código de rastreo <strong>{trackingCode}</strong> ha completado los procesos aduanales y se encuentra <strong>DISPONIBLE PARA RETIRO</strong> en nuestra ventanilla oficial.
            </p>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px; color: #166534; font-size: 14px;">Sucursal de Entrega Autorizada:</h4>
              <p style="margin: 4px 0; font-size: 13px; color: #14532d;"><strong>Sede:</strong> {sedeDestinoNombre}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #14532d;"><strong>Dirección:</strong> {sedeDestinoDireccion}</p>
              <p style="margin: 4px 0; font-size: 13px; color: #14532d;"><strong>Horario de Atención:</strong> {horarioAtencion ?? "Lunes a Sábado de 8:00 AM a 5:00 PM"}</p>
            </div>

            <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 8px; color: #1e40af; font-size: 13px;">Requisitos Obligatorios para Retiro:</h4>
              <ol style="margin: 0; padding-left: 20px; font-size: 12px; color: #1e3a8a; line-height: 1.6;">
                <li>Presentar documento de identidad original físico (Cédula o Pasaporte).</li>
                <li>Mencionar tu código de guía <strong>{trackingCode}</strong> al operador de ventanilla.</li>
              </ol>
            </div>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
            <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
              © {DateTime.UtcNow.Year} NicaLogistics • Logística Sede a Sede • Cero entregas a domicilio.
            </p>
          </div>
        </body>
        </html>
        """;

        return await SendEmailAsync(to, subject, html);
    }

    public async Task<bool> SendLowStockAlertEmailAsync(
        string productName,
        string sku,
        int currentStock,
        int minStock,
        string? adminEmail = null)
    {
        var targetAdmin = !string.IsNullOrWhiteSpace(adminEmail) ? adminEmail : _adminEmail;
        var isZero = currentStock <= 0;
        var subject = isZero 
            ? $"[ALERTA CRÍTICA] Stock AGOTADO en producto: {productName} ({sku})" 
            : $"[ALERTA INVENTARIO] Stock mínimo alcanzado: {productName} ({sku})";

        var html = $"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"/></head>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background: {(isZero ? "#fee2e2" : "#fef3c7")}; color: {(isZero ? "#dc2626" : "#d97706")}; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                {(isZero ? "⚠️ Stock en Cero" : "⚠️ Nivel Mínimo Superado")}
              </span>
              <h2 style="color: #1a56db; margin: 12px 0 4px; font-size: 24px; font-weight: 800;">NICALOGISTICS</h2>
              <p style="color: #64748b; font-size: 13px; margin: 0;">Supervisión de Inventario y Kardex</p>
            </div>

            <h3 style="color: #0f172a; font-size: 17px; margin-bottom: 12px;">Alerta Automática para el Administrador</h3>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Se ha detectado una reducción crítica de existencias tras las últimas transacciones comerciales en el catálogo.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px; color: #64748b; font-weight: 600;">Producto:</td>
                <td style="padding: 8px; color: #0f172a; font-weight: 700;">{productName}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px; color: #64748b; font-weight: 600;">SKU:</td>
                <td style="padding: 8px; font-family: monospace; color: #1a56db; font-weight: 700;">{sku}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px; color: #64748b; font-weight: 600;">Stock Actual:</td>
                <td style="padding: 8px; font-weight: 800; color: {(isZero ? "#dc2626" : "#d97706")};">{currentStock} unidades</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px; color: #64748b; font-weight: 600;">Umbral Mínimo:</td>
                <td style="padding: 8px; color: #334155;">{minStock} unidades</td>
              </tr>
            </table>

            <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
              Por favor, ingresa al panel de control <strong>/panel/inventario</strong> para registrar un ingreso de mercadería o ajustar existencias en Kardex.
            </p>

            <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
            <p style="font-size: 11px; text-align: center; color: #94a3b8; margin: 0;">
              Alerta generada por el Motor de Control de Existencias NicaLogistics.
            </p>
          </div>
        </body>
        </html>
        """;

        return await SendEmailAsync(targetAdmin, subject, html);
    }
}
