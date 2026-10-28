using Microsoft.AspNetCore.Mvc;
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
}
