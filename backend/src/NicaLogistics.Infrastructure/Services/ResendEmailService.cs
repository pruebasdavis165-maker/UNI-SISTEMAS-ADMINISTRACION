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
            ?? "davismunoz165@gmail.com";
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
        <html lang="es">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Código de Verificación NicaLogistics</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
            <tr>
              <td style="background: linear-gradient(90deg, #1a56db 0%, #d946ef 100%); height: 6px;"></td>
            </tr>
            <tr>
              <td style="padding: 36px 36px 20px 36px; text-align: center;">
                <div style="display: inline-block; padding: 6px 14px; background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 9999px; margin-bottom: 16px;">
                  <span style="color: #1a56db; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Seguridad & Autenticación Oficial</span>
                </div>
                <h1 style="color: #1a56db; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">NICALOGISTICS</h1>
                <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0; font-weight: 500;">Circuito Bilateral Miami Hub ⇄ Managua</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 36px 32px 36px;">
                <p style="font-size: 15px; color: #1e293b; margin: 0 0 12px 0; font-weight: 600;">
                  Hola {clientName},
                </p>
                <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 28px 0;">
                  Gracias por registrarte en NicaLogistics. Para activar tu cuenta de cliente y comenzar a operar en nuestro sistema, ingresa este código de verificación:
                </p>
                <div style="background-color: #f8fafc; border: 2px dashed #bfdbfe; border-radius: 16px; padding: 24px; text-align: center; margin: 0 0 28px 0;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; display: block; margin-bottom: 10px;">Código OTP de 6 Dígitos</span>
                  <div style="display: inline-block; font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1a56db; background: #ffffff; border: 1px solid #93c5fd; padding: 12px 28px; border-radius: 12px; box-shadow: 0 2px 4px rgba(26, 86, 219, 0.08);">
                    {otpCode}
                  </div>
                  <p style="font-size: 12px; color: #64748b; margin: 12px 0 0 0;">
                    ⏱️ Este código vence en <strong>15 minutos</strong>.
                  </p>
                </div>
                <div style="background-color: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                  <p style="font-size: 12px; color: #475569; line-height: 1.5; margin: 0;">
                    🔒 <strong>Aviso de Seguridad:</strong> Ningún colaborador de NicaLogistics te solicitará este código. Si no realizaste esta solicitud, ignora este mensaje.
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.6;">
                  © {DateTime.UtcNow.Year} NicaLogistics Enterprise. Todos los derechos reservados.<br/>
                  Entrega exclusiva en Ventanilla Oficial • Sin envíos a domicilio
                </p>
              </td>
            </tr>
          </table>
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
        IEnumerable<(string ProductName, int Quantity, decimal Subtotal)> items,
        decimal costoEnvio = 0,
        string modalidadEnvio = "Terrestre",
        decimal pesoTotalLibras = 0)
    {
        var subject = $"Recibo de Compra #{orderNumber} - Tracking: {trackingCode}";
        var itemsRows = new StringBuilder();
        foreach (var item in items)
        {
            itemsRows.Append($"""
            <tr>
              <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #1e293b; font-weight: 500;">{item.ProductName}</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 13px; color: #64748b;">{item.Quantity}</td>
              <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 13px; font-weight: 700; color: #1e293b;">${item.Subtotal:F2}</td>
            </tr>
            """);
        }
        var isPickupLocal = costoEnvio <= 0 && sedeOrigen.Equals(sedeDestino, StringComparison.OrdinalIgnoreCase);
        var fleteDisplay = isPickupLocal ? "<span style='color: #10b981; font-weight: 700;'>GRATIS ($0.00 USD)</span>" : $"<strong>${costoEnvio:F2} USD</strong>";
        var html = $"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Recibo de Pedido #{orderNumber}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #1e293b;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
            <tr>
              <td style="background: linear-gradient(90deg, #1a56db 0%, #10b981 100%); height: 6px;"></td>
            </tr>
            <tr>
              <td style="padding: 36px 36px 20px 36px; text-align: center;">
                <div style="display: inline-block; padding: 6px 14px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; margin-bottom: 16px;">
                  <span style="color: #059669; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">✓ Pago Aprobado • Encomienda Oficial</span>
                </div>
                <h1 style="color: #1a56db; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">NICALOGISTICS</h1>
                <p style="color: #64748b; font-size: 14px; margin: 6px 0 0 0;">Comprobante de Compra #{orderNumber}</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 36px 28px 36px;">
                <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 24px 0;">
                  Estimado/a <strong>{clientName}</strong>, tu compra ha sido confirmada y tu encomienda ya se encuentra en nuestro sistema logístico bajo la modalidad <strong>{modalidadEnvio}</strong>.
                </p>
                <div style="background: linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%); border: 2px dashed #93c5fd; border-radius: 16px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                  <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; display: block;">Código Oficial de Rastreo</span>
                  <div style="font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 32px; font-weight: 800; color: #1a56db; margin: 8px 0; letter-spacing: 3px;">
                    {trackingCode}
                  </div>
                  <div style="display: inline-flex; gap: 8px; font-size: 12px; color: #475569; font-weight: 500;">
                    <span>Modalidad: <strong>{modalidadEnvio}</strong></span>
                    {(pesoTotalLibras > 0 ? $"• <span>Peso Total: <strong>{pesoTotalLibras:F1} lbs</strong></span>" : "")}
                  </div>
                </div>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="48%" style="vertical-align: top;">
                        <span style="font-size: 10px; font-weight: 700; color: #1a56db; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Sede de Origen</span>
                        <strong style="font-size: 13px; color: #1e293b; display: block; margin-top: 2px;">{sedeOrigen}</strong>
                      </td>
                      <td width="4%" style="text-align: center; font-size: 16px; color: #94a3b8;">➔</td>
                      <td width="48%" style="vertical-align: top; text-align: right;">
                        <span style="font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.5px; display: block;">Ventanilla de Retiro</span>
                        <strong style="font-size: 13px; color: #064e3b; display: block; margin-top: 2px;">{sedeDestino}</strong>
                      </td>
                    </tr>
                  </table>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden;">
                  <thead>
                    <tr style="background-color: #f8fafc;">
                      <th style="padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Producto</th>
                      <th style="padding: 12px 14px; text-align: center; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Cant.</th>
                      <th style="padding: 12px 14px; text-align: right; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsRows}
                  </tbody>
                  <tfoot>
                    <tr style="border-top: 1px solid #e2e8f0;">
                      <td colspan="2" style="padding: 10px 14px; text-align: right; font-size: 13px; color: #64748b;">Subtotal de Mercancía:</td>
                      <td style="padding: 10px 14px; text-align: right; font-size: 13px; font-weight: 600; color: #1e293b;">${(total - costoEnvio):F2} USD</td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding: 10px 14px; text-align: right; font-size: 13px; color: #64748b;">Flete Logístico ({modalidadEnvio}):</td>
                      <td style="padding: 10px 14px; text-align: right; font-size: 13px; color: #1e293b;">{fleteDisplay}</td>
                    </tr>
                    <tr style="border-top: 2px solid #e2e8f0; background-color: #f8fafc;">
                      <td colspan="2" style="padding: 14px; text-align: right; font-weight: 700; font-size: 15px; color: #1e293b;">Total Pagado:</td>
                      <td style="padding: 14px; text-align: right; font-weight: 800; font-size: 18px; color: #1a56db;">${total:F2} USD</td>
                    </tr>
                  </tfoot>
                </table>
                <div style="background-color: #f8fafc; border-left: 4px solid #1a56db; padding: 16px 18px; border-radius: 0 12px 12px 0;">
                  <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px;">
                    📋 Requisitos para Retiro en Ventanilla
                  </h4>
                  <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #475569; line-height: 1.6;">
                    <li>Presentar <strong>Cédula de Identidad original física o Pasaporte Oficial vigente</strong>.</li>
                    <li>Presentar el <strong>Código de Rastreo ({trackingCode})</strong> en tu teléfono.</li>
                    <li>Retiro disponible únicamente en la ventanilla autorizada: <strong>{sedeDestino}</strong>.</li>
                  </ul>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.6;">
                  © {DateTime.UtcNow.Year} NicaLogistics Enterprise. Operaciones bilaterales Miami Hub ⇄ Managua.<br/>
                  Entrega exclusiva en Ventanilla Oficial • Sin envíos a domicilio
                </p>
              </td>
            </tr>
          </table>
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
