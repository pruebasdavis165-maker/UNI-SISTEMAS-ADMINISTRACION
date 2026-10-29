using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PagosController : ControllerBase
{
    private readonly IPaymentGatewayService _paymentGateway;
    private readonly IProductService _productService;

    public PagosController(IPaymentGatewayService paymentGateway, IProductService productService)
    {
        _paymentGateway = paymentGateway;
        _productService = productService;
    }

    /// <summary>
    /// Crea un PaymentIntent en la pasarela de pagos (Stripe Sandbox) desacoplada.
    /// </summary>
    [HttpPost("create-payment-intent")]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequestDto request)
    {
        try
        {
            decimal totalCalculado = request.Monto;

            // Si se envían items, recalculamos el total contra base de datos para máxima integridad financiera
            if (request.Items != null && request.Items.Any())
            {
                decimal sumaItems = 0m;
                foreach (var item in request.Items)
                {
                    if (item.Cantidad <= 0)
                        return BadRequest(new { message = "La cantidad de cada producto debe ser mayor a cero." });

                    var prod = await _productService.GetByIdAsync(item.ProductoId);
                    if (prod == null || !prod.Activo)
                        return BadRequest(new { message = $"El producto con ID {item.ProductoId} no está disponible." });

                    sumaItems += prod.Precio * item.Cantidad;
                }

                if (sumaItems > 0)
                {
                    totalCalculado = sumaItems;
                }
            }

            if (totalCalculado <= 0)
            {
                return BadRequest(new { message = "El monto a pagar debe ser mayor a $0.00 USD." });
            }

            var result = await _paymentGateway.CreatePaymentIntentAsync(
                amount: totalCalculado,
                currency: "usd",
                description: request.Descripcion ?? "Cobro seguro e-commerce NicaLogistics (Circuito Sede a Sede)",
                metadata: new Dictionary<string, string>
                {
                    { "Plataforma", "NicaLogistics Enterprise" },
                    { "TipoOperacion", "Checkout Sede a Sede" }
                }
            );

            return Ok(new PaymentIntentResponseDto(
                ClientSecret: result.ClientSecret,
                PaymentIntentId: result.PaymentIntentId,
                Monto: totalCalculado,
                Moneda: result.Currency
            ));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error inesperado al inicializar la pasarela de pagos.", error = ex.Message });
        }
    }

    /// <summary>
    /// Verifica el estado de una transacción en la pasarela desacoplada.
    /// </summary>
    [HttpGet("verify/{paymentIntentId}")]
    [Authorize]
    public async Task<IActionResult> VerifyPayment(string paymentIntentId)
    {
        var result = await _paymentGateway.VerifyPaymentAsync(paymentIntentId);
        return Ok(result);
    }
}
