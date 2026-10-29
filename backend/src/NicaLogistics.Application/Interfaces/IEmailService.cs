namespace NicaLogistics.Application.Interfaces;

public interface IEmailService
{
    /// <summary>
    /// Envío genérico de correo electrónico vía Resend API.
    /// </summary>
    Task<bool> SendEmailAsync(string to, string subject, string htmlContent);

    /// <summary>
    /// Caso 1: Código de verificación (OTP) tras registro de usuario.
    /// </summary>
    Task<bool> SendVerificationOtpEmailAsync(string to, string clientName, string otpCode);

    /// <summary>
    /// Caso 1b: Recuperación de contraseña segura.
    /// </summary>
    Task<bool> SendPasswordResetEmailAsync(string to, string clientName, string resetTokenOrLink);

    /// <summary>
    /// Caso 2: Recibo de compra con Código de Rastreo focalizado tras pago en Checkout.
    /// </summary>
    Task<bool> SendOrderReceiptEmailAsync(
        string to,
        string clientName,
        string orderNumber,
        string trackingCode,
        decimal total,
        string sedeOrigen,
        string sedeDestino,
        IEnumerable<(string ProductName, int Quantity, decimal Subtotal)> items
    );

    /// <summary>
    /// Caso 3: Alerta Logística cuando la encomienda cambia a 'Listo para retiro en ventanilla'.
    /// </summary>
    Task<bool> SendReadyForPickupEmailAsync(
        string to,
        string clientName,
        string trackingCode,
        string sedeDestinoNombre,
        string sedeDestinoDireccion,
        string? horarioAtencion
    );

    /// <summary>
    /// Caso 4: Alerta de Stock crítico (0 o stock mínimo) enviada al Administrador.
    /// </summary>
    Task<bool> SendLowStockAlertEmailAsync(
        string productName,
        string sku,
        int currentStock,
        int minStock,
        string? adminEmail = null
    );
}
