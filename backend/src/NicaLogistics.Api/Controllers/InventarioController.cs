using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Vendedor,Logística,Logistica")]
public class InventarioController : ControllerBase
{
    private readonly IInventoryService _inventoryService;
    private readonly IProductService _productService;

    public InventarioController(IInventoryService inventoryService, IProductService productService)
    {
        _inventoryService = inventoryService;
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetInventory([FromQuery] string? search, [FromQuery] Guid? categoriaId)
    {
        var products = await _productService.GetAllAsync(search, categoriaId, activeOnly: null);
        return Ok(products);
    }

    [HttpGet("stock")]
    public async Task<IActionResult> GetStock([FromQuery] string? search, [FromQuery] Guid? categoriaId)
    {
        var products = await _productService.GetAllAsync(search, categoriaId, activeOnly: null);
        return Ok(products);
    }

    [HttpGet("movimientos")]
    public async Task<IActionResult> GetMovements([FromQuery] Guid? productoId, [FromQuery] int limit = 100)
    {
        var movements = await _inventoryService.GetMovementsAsync(productoId, limit);
        return Ok(movements);
    }

    [HttpPost("movimientos")]
    public async Task<IActionResult> RegisterMovement([FromBody] RegisterMovementDto dto)
    {
        try
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? userId = Guid.TryParse(userIdStr, out var parsedId) ? parsedId : null;

            var movement = await _inventoryService.RegisterMovementAsync(dto, userId);
            return Ok(movement);
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

    [HttpGet("alertas")]
    public async Task<IActionResult> GetAlerts()
    {
        var alerts = await _inventoryService.GetStockAlertsAsync();
        return Ok(alerts);
    }
}
