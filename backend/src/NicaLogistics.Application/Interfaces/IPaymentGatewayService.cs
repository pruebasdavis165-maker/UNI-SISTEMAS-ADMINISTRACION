namespace NicaLogistics.Application.Interfaces;

public record PaymentIntentResult(
    string PaymentIntentId,
    string ClientSecret,
    long AmountInCents,
    string Currency,
    string Status
);

public record PaymentVerificationResult(
    bool IsSuccessful,
    string PaymentIntentId,
    string Status,
    decimal AmountPaid,
    string Currency,
    string? FailureMessage = null
);

public interface IPaymentGatewayService
{
    Task<PaymentIntentResult> CreatePaymentIntentAsync(
        decimal amount, 
        string currency = "usd", 
        string? description = null, 
        Dictionary<string, string>? metadata = null
    );

    Task<PaymentVerificationResult> VerifyPaymentAsync(string paymentIntentId);
}
