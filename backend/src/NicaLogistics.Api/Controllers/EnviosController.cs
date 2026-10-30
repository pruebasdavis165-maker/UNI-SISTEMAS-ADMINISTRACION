using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EnviosController : ControllerBase
{
    private readonly IShippingService _shippingService;

    public EnviosController(IShippingService shippingService)
    {
        _shippingService = shippingService;
    }

    [HttpGet("formas")]
    public async Task<IActionResult> GetFormasEnvio([FromQuery] bool? activeOnly)
    {
        var result = await _shippingService.GetFormasEnvioAsync(activeOnly);
        return Ok(result);
    }

    [HttpGet("formas/{id:guid}")]
    public async Task<IActionResult> GetFormaEnvioById(Guid id)
    {
        try
        {
            var result = await _shippingService.GetFormaEnvioByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("cotizar")]
    public async Task<IActionResult> CotizarRuta([FromBody] CotizarEnvioRequestDto request)
    {
        try
        {
            var opciones = await _shippingService.CotizarRutaAsync(request);
            return Ok(opciones);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("formas")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateFormaEnvio([FromBody] CreateFormaEnvioDto dto)
    {
        try
        {
            var created = await _shippingService.CreateFormaEnvioAsync(dto);
            return CreatedAtAction(nameof(GetFormaEnvioById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("formas/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateFormaEnvio(Guid id, [FromBody] UpdateFormaEnvioDto dto)
    {
        try
        {
            var updated = await _shippingService.UpdateFormaEnvioAsync(id, dto);
            return Ok(updated);
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
