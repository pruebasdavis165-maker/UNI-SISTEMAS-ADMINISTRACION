using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using NicaLogistics.Application.Interfaces;
using Stripe;

namespace NicaLogistics.Infrastructure.Services;

public class StripePaymentGatewayService : IPaymentGatewayService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<StripePaymentGatewayService> _logger;
    private readonly string _apiKey;

    public StripePaymentGatewayService(IConfiguration configuration, ILogger<StripePaymentGatewayService> logger)
    {
        _configuration = configuration;
        _logger = logger;

        _apiKey = _configuration["Stripe:SecretKey"] 
            ?? Environment.GetEnvironmentVariable("STRIPE_SECRET_KEY")
            ?? string.Empty;

        StripeConfiguration.ApiKey = _apiKey;
    }

    public async Task<PaymentIntentResult> CreatePaymentIntentAsync(
        decimal amount, 
        string currency = "usd", 
        string? description = null, 
        Dictionary<string, string>? metadata = null)
    {
        if (amount <= 0)
            throw new ArgumentException("El monto a cobrar debe ser mayor a cero.", nameof(amount));

        long amountInCents = (long)Math.Round(amount * 100m, MidpointRounding.AwayFromZero);

        var options = new PaymentIntentCreateOptions
        {
            Amount = amountInCents,
            Currency = currency.ToLowerInvariant(),
            Description = description ?? "Pago de pedido Sede a Sede en NicaLogistics Enterprise",
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
            {
                Enabled = true,
            },
            Metadata = metadata ?? new Dictionary<string, string>()
        };

        try
        {
            var service = new PaymentIntentService();
            var paymentIntent = await service.CreateAsync(options);

            _logger.LogInformation("Stripe PaymentIntent creado con éxito: {PaymentIntentId} por un monto de {Amount} {Currency}", 
                paymentIntent.Id, amount, currency);

            return new PaymentIntentResult(
                PaymentIntentId: paymentIntent.Id,
                ClientSecret: paymentIntent.ClientSecret,
                AmountInCents: amountInCents,
                Currency: currency,
                Status: paymentIntent.Status
            );
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Error al generar PaymentIntent en Stripe: {ErrorMessage}", ex.Message);
            throw new InvalidOperationException($"Error en pasarela Stripe: {ex.Message}", ex);
        }
    }

    public async Task<PaymentVerificationResult> VerifyPaymentAsync(string paymentIntentId)
    {
        if (string.IsNullOrWhiteSpace(paymentIntentId))
            return new PaymentVerificationResult(false, string.Empty, "INVALID_ID", 0m, "usd", "El ID de la transacción no es válido.");

        try
        {
            var service = new PaymentIntentService();
            var paymentIntent = await service.GetAsync(paymentIntentId);

            bool isSuccess = paymentIntent.Status == "succeeded" || paymentIntent.Status == "requires_capture";
            decimal amountPaid = paymentIntent.Amount / 100m;

            _logger.LogInformation("Verificación de PaymentIntent {PaymentIntentId}: Estado {Status}, Monto {Amount}",
                paymentIntent.Id, paymentIntent.Status, amountPaid);

            return new PaymentVerificationResult(
                IsSuccessful: isSuccess,
                PaymentIntentId: paymentIntent.Id,
                Status: paymentIntent.Status,
                AmountPaid: amountPaid,
                Currency: paymentIntent.Currency,
                FailureMessage: isSuccess ? null : $"Estado del intento de pago: {paymentIntent.Status}"
            );
        }
        catch (StripeException ex)
        {
            _logger.LogError(ex, "Error al verificar PaymentIntent {PaymentIntentId} en Stripe", paymentIntentId);
            return new PaymentVerificationResult(
                IsSuccessful: false,
                PaymentIntentId: paymentIntentId,
                Status: "ERROR",
                AmountPaid: 0m,
                Currency: "usd",
                FailureMessage: ex.Message
            );
        }
    }
}
