using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PedidosController : ControllerBase
{
    private readonly IOrderService _orderService;

    public PedidosController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "Usuario no identificado en el token." });

            var result = await _orderService.CreateOrderAsync(userId, dto);
            return StatusCode(201, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al procesar el pedido.", error = ex.Message });
        }
    }

    [HttpGet("mis-pedidos")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Usuario no identificado en el token." });

        var orders = await _orderService.GetMyOrdersAsync(userId);
        return Ok(orders);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Vendedor,Logística")]
    public async Task<IActionResult> GetAllOrders([FromQuery] string? estado)
    {
        var orders = await _orderService.GetAllOrdersAsync(estado);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Guid.TryParse(userIdStr, out var userId);
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "";

            var order = await _orderService.GetOrderByIdAsync(id, userId, role);
            return Ok(order);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/cancelar")]
    public async Task<IActionResult> CancelOrder(Guid id, [FromBody] CancelOrderDto? dto)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "Usuario no identificado en el token." });

            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "";
            var result = await _orderService.CancelOrderAsync(id, userId, role, dto?.Motivo);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al cancelar el pedido.", error = ex.Message });
        }
    }
}
