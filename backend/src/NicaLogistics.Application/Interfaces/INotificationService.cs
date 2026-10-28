namespace NicaLogistics.Application.Interfaces;

public interface INotificationService
{
    Task SendReadyForPickupNotificationAsync(
        string clientEmail,
        string clientName,
        string trackingCode,
        string branchName,
        string branchAddress,
        string? branchSchedule
    );
}
