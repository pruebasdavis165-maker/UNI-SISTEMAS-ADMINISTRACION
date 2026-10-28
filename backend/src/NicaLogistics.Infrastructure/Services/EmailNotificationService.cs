using Microsoft.Extensions.Logging;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Infrastructure.Services;

public class EmailNotificationService : INotificationService
{
    private readonly ILogger<EmailNotificationService> _logger;

    public EmailNotificationService(ILogger<EmailNotificationService> logger)
    {
        _logger = logger;
    }

    public Task SendReadyForPickupNotificationAsync(
        string clientEmail,
        string clientName,
        string trackingCode,
        string branchName,
        string branchAddress,
        string? branchSchedule)
    {
        var message = $"""
        ================================================================================
        [NICALOGISTICS - NOTIFICACIÓN OFICIAL DE DISPONIBILIDAD PARA RETIRO]
        Destinatario: {clientName} <{clientEmail}>
        Código de Rastreo: {trackingCode}
        Estado Actual: LISTA PARA RETIRO EN VENTANILLA
        --------------------------------------------------------------------------------
        Estimado/a {clientName},
        
        Le informamos que su paquete con código {trackingCode} ha arribado exitosamente
        a nuestra sucursal de ventanilla y ya se encuentra DISPONIBLE PARA SU RETIRO.

        DETALLES DE LA SUCURSAL DE ENTREGA:
        • Sede: {branchName}
        • Dirección: {branchAddress}
        • Horario de Atención: {branchSchedule ?? "Lunes a Sábado de 8:00 AM a 5:00 PM"}
        
        REQUISITOS OBLIGATORIOS PARA EL RETIRO:
        1. Presentar documento de identidad original (Cédula o Pasaporte).
        2. Proporcionar su código de tracking al operador de ventanilla.

        Nota: Recordamos que NicaLogistics opera bajo el modelo exclusivo Sede a Sede.
        ================================================================================
        """;

        _logger.LogInformation("{NotificationMessage}", message);
        Console.WriteLine(message);

        return Task.CompletedTask;
    }
}
