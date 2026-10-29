using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SedesController : ControllerBase
{
    private readonly ISedeService _sedeService;

    public SedesController(ISedeService sedeService)
    {
        _sedeService = sedeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly)
    {
        var sedes = await _sedeService.GetAllAsync(activeOnly);
        return Ok(sedes);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var sede = await _sedeService.GetByIdAsync(id);
            return Ok(sede);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateSedeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Codigo) || string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.DireccionVentanilla))
        {
            return BadRequest(new { message = "Código, nombre y dirección de ventanilla son requeridos." });
        }

        var created = await _sedeService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSedeDto dto)
    {
        try
        {
            var updated = await _sedeService.UpdateAsync(id, dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/toggle-status")]
    [HttpPut("{id:guid}/toggle-status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        try
        {
            var activo = await _sedeService.ToggleStatusAsync(id);
            return Ok(new { activo, message = activo ? "Sede activada exitosamente." : "Sede desactivada exitosamente." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var physicallyDeleted = await _sedeService.DeleteAsync(id);
            return Ok(new { 
                success = true, 
                physicallyDeleted,
                message = physicallyDeleted 
                    ? "Sede eliminada permanentemente de la base de datos." 
                    : "Sede desactivada para conservar histórico de envíos." 
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
