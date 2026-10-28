using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;

namespace NicaLogistics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriasController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriasController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly)
    {
        var categories = await _categoryService.GetAllAsync(activeOnly);
        return Ok(categories);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var category = await _categoryService.GetByIdAsync(id);
            return Ok(category);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Vendedor")]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        try
        {
            var created = await _categoryService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Vendedor")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryDto dto)
    {
        try
        {
            var updated = await _categoryService.UpdateAsync(id, dto);
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

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Vendedor")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _categoryService.DeleteAsync(id);
            return Ok(new { message = "Categoría desactivada con éxito." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
