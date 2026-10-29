using Microsoft.Extensions.Logging;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Infrastructure.Services;

public class EmailNotificationService : INotificationService
{
    private readonly ILogger<EmailNotificationService> _logger;
    private readonly IEmailService _emailService;

    public EmailNotificationService(ILogger<EmailNotificationService> logger, IEmailService emailService)
    {
        _logger = logger;
        _emailService = emailService;
    }

    public async Task SendReadyForPickupNotificationAsync(
        string clientEmail,
        string clientName,
        string trackingCode,
        string branchName,
        string branchAddress,
        string? branchSchedule)
    {
        _logger.LogInformation("[EmailNotificationService] Disparando notificación por correo para {ClientEmail} con tracking {TrackingCode}", clientEmail, trackingCode);

        // Envío transaccional vía Resend API
        await _emailService.SendReadyForPickupEmailAsync(
            to: clientEmail,
            clientName: clientName,
            trackingCode: trackingCode,
            sedeDestinoNombre: branchName,
            sedeDestinoDireccion: branchAddress,
            horarioAtencion: branchSchedule
        );
    }
}
