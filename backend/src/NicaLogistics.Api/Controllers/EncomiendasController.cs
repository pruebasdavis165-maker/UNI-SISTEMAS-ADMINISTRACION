using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EncomiendasController : ControllerBase
{
    private readonly IShipmentService _shipmentService;

    public EncomiendasController(IShipmentService shipmentService)
    {
        _shipmentService = shipmentService;
    }

    /// <summary>
    /// Consulta pública de rastreo por Código de Tracking (RF-10)
    /// </summary>
    [HttpGet("rastreo/{trackingCode}")]
    public async Task<IActionResult> Track(string trackingCode)
    {
        try
        {
            var shipment = await _shipmentService.GetByTrackingCodeAsync(trackingCode);
            return Ok(shipment);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Logística,Vendedor")]
    public async Task<IActionResult> GetAll([FromQuery] string? estado, [FromQuery] Guid? sedeId)
    {
        var list = await _shipmentService.GetAllAsync(estado, sedeId);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var shipment = await _shipmentService.GetByIdAsync(id);
            return Ok(shipment);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("mis-encomiendas")]
    [Authorize]
    public async Task<IActionResult> GetMyShipments()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized(new { message = "Usuario no identificado en el token." });

        var shipments = await _shipmentService.GetMyShipmentsAsync(userId);
        return Ok(shipments);
    }

    [HttpPut("{id:guid}/estado")]
    [Authorize(Roles = "Admin,Logística")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateShipmentStatusDto dto)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "Usuario no identificado en el token." });

            var result = await _shipmentService.UpdateStatusAsync(id, userId, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:guid}/entregar")]
    [Authorize(Roles = "Admin,Logística")]
    public async Task<IActionResult> Deliver(Guid id, [FromBody] DeliverRequestDto? dto)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var userId))
                return Unauthorized(new { message = "Usuario no identificado en el token." });

            var result = await _shipmentService.DeliverShipmentAsync(id, userId, dto?.Notas);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class DeliverRequestDto
{
    public string? Notas { get; set; }
}
