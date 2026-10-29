namespace NicaLogistics.Application.DTOs;

public record CreatePaymentIntentRequestDto(
    decimal Monto,
    string? Descripcion,
    List<OrderItemRequestDto>? Items
);

public record PaymentIntentResponseDto(
    string ClientSecret,
    string PaymentIntentId,
    decimal Monto,
    string Moneda
);
