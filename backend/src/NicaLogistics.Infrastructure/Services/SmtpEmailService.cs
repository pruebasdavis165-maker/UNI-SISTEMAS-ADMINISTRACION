using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Infrastructure.Services;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly string _host;
    private readonly int _port;
    private readonly string _user;
    private string _pass;
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly string _adminEmail;

    public SmtpEmailService(
        IConfiguration configuration,
        ILogger<SmtpEmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        _host = _configuration["Smtp:Host"] 
            ?? Environment.GetEnvironmentVariable("SMTP_HOST") 
            ?? "smtp.gmail.com";

        var portStr = _configuration["Smtp:Port"] 
            ?? Environment.GetEnvironmentVariable("SMTP_PORT") 
            ?? "587";
        _port = int.TryParse(portStr, out var p) ? p : 587;

        _user = _configuration["Smtp:User"] 
            ?? Environment.GetEnvironmentVariable("SMTP_USER") 
            ?? "pruebasdavis16@gmail.com";

        _pass = _configuration["Smtp:Pass"] 
            ?? Environment.GetEnvironmentVariable("SMTP_PASS") 
            ?? string.Empty;

        _fromEmail = _configuration["Smtp:FromEmail"] 
            ?? Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL") 
            ?? _user;

        _fromName = _configuration["Smtp:FromName"] 
            ?? Environment.GetEnvironmentVariable("SMTP_FROM_NAME") 
            ?? "NicaLogistics";

        _adminEmail = _configuration["Smtp:AdminEmail"] 
            ?? Environment.GetEnvironmentVariable("SMTP_ADMIN_EMAIL") 
            ?? "davismunoz165@gmail.com";

        // Carga de respaldo desde archivo .env local para ejecución fuera de Docker
        if (string.IsNullOrWhiteSpace(_pass))
        {
            TryLoadPasswordFromEnvFile();
        }
    }

    private void TryLoadPasswordFromEnvFile()
    {
        try
        {
            var searchPaths = new[]
            {
                Path.Combine(AppContext.BaseDirectory, ".env"),
                Path.Combine(AppContext.BaseDirectory, "..", ".env"),
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", ".env"),
                Path.Combine(Directory.GetCurrentDirectory(), ".env"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", ".env")
            };

            foreach (var path in searchPaths)
            {
                if (File.Exists(path))
                {
                    var lines = File.ReadAllLines(path);
                    foreach (var line in lines)
                    {
                        var trimmed = line.Trim();
                        if (trimmed.StartsWith("SMTP_PASS=") && !trimmed.StartsWith("#"))
                        {
                            _pass = trimmed.Substring("SMTP_PASS=".Length).Trim().Trim('"', '\'');
                            _logger.LogInformation("[SmtpEmailService] Credenciales SMTP cargadas desde archivo .env local.");
                            return;
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning("[SmtpEmailService] No se pudo leer archivo .env: {Message}", ex.Message);
        }
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string htmlContent)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(to))
            {
                _logger.LogWarning("[SmtpEmailService] Intento de envío a destinatario vacío o nulo.");
                return false;
            }

            var cleanRecipient = to.Trim();

            if (string.IsNullOrWhiteSpace(_pass))
            {
                _logger.LogWarning("[SmtpEmailService] ⚠️ No se ha configurado contraseña SMTP (SMTP_PASS). Verifique variables de entorno para {To}", cleanRecipient);
                return false;
            }

            _logger.LogInformation("[SmtpEmailService] 🚀 Despachando correo vía Gmail SMTP a {To} | Asunto: '{Subject}' | De: {FromName} <{FromEmail}>", cleanRecipient, subject, _fromName, _fromEmail);

            using var client = new SmtpClient(_host, _port)
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(_user, _pass),
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 20000 // 20 segundos
            };

            using var message = new MailMessage
            {
                From = new MailAddress(_fromEmail, _fromName, Encoding.UTF8),
                Subject = subject,
                SubjectEncoding = Encoding.UTF8,
                Body = htmlContent,
                BodyEncoding = Encoding.UTF8,
                IsBodyHtml = true
            };

            message.To.Add(new MailAddress(cleanRecipient));

            await client.SendMailAsync(message);

            _logger.LogInformation("[SmtpEmailService] ✅ Correo entregado exitosamente vía Gmail SMTP al destinatario real {To}.", cleanRecipient);
            return true;
        }
        catch (SmtpException smtpEx)
        {
            _logger.LogError(smtpEx, "[SmtpEmailService] ❌ Error SMTP al despachar correo a {To}. Código de estado: {StatusCode}, Mensaje: {Message}", to, smtpEx.StatusCode, smtpEx.Message);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[SmtpEmailService] ❌ Error inesperado al enviar correo a {To}: {Message}", to, ex.Message);
            return false;
        }
    }

    public async Task<bool> SendVerificationOtpEmailAsync(string to, string clientName, string otpCode)
    {
        _logger.LogInformation("================================================================================");
        _logger.LogInformation("🔑 [NICALOGISTICS OTP GMAIL SMTP] DESTINATARIO: {To} ({ClientName}) | CÓDIGO OTP: {OtpCode} | VIGENCIA: 15 MINUTOS", to, clientName, otpCode);
        _logger.LogInformation("================================================================================");

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
        _logger.LogInformation("================================================================================");
        _logger.LogInformation("📦 [NICALOGISTICS RECIBO GMAIL SMTP] DESTINATARIO: {To} ({ClientName}) | ORDEN: #{OrderNumber} | GUÍA: {TrackingCode} | TOTAL: ${Total:F2} USD", to, clientName, orderNumber, trackingCode, total);
        _logger.LogInformation("================================================================================");

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
