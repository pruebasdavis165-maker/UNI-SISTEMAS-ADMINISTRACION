using Microsoft.EntityFrameworkCore;
using NicaLogistics.Application.DTOs;
using NicaLogistics.Application.Interfaces;
using NicaLogistics.Domain.Entities;
using NicaLogistics.Infrastructure.Data;

namespace NicaLogistics.Infrastructure.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(bool? activeOnly = null)
    {
        var query = _context.Categorias.AsNoTracking();

        if (activeOnly.HasValue && activeOnly.Value)
        {
            query = query.Where(c => c.Activo);
        }

        var categories = await query
            .OrderBy(c => c.Nombre)
            .Select(c => new CategoryDto(
                c.Id,
                c.Nombre,
                c.Descripcion,
                c.Activo,
                _context.Productos.Count(p => p.CategoriaId == c.Id && p.Activo),
                c.CreadoEn
            ))
            .ToListAsync();

        return categories;
    }

    public async Task<CategoryDto> GetByIdAsync(Guid id)
    {
        var c = await _context.Categorias.FindAsync(id);
        if (c == null)
            throw new KeyNotFoundException("Categoría no encontrada.");

        var count = await _context.Productos.CountAsync(p => p.CategoriaId == c.Id && p.Activo);

        return new CategoryDto(c.Id, c.Nombre, c.Descripcion, c.Activo, count, c.CreadoEn);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
    {
        var normalizedName = dto.Nombre.Trim();

        if (await _context.Categorias.AnyAsync(c => c.Nombre.ToLower() == normalizedName.ToLower()))
        {
            throw new InvalidOperationException("Ya existe una categoría con este nombre.");
        }

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Nombre = normalizedName,
            Descripcion = dto.Descripcion?.Trim(),
            Activo = true,
            CreadoEn = DateTime.UtcNow
        };

        _context.Categorias.Add(category);
        await _context.SaveChangesAsync();

        return new CategoryDto(category.Id, category.Nombre, category.Descripcion, category.Activo, 0, category.CreadoEn);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryDto dto)
    {
        var category = await _context.Categorias.FindAsync(id);
        if (category == null)
            throw new KeyNotFoundException("Categoría no encontrada.");

        var normalizedName = dto.Nombre.Trim();

        if (await _context.Categorias.AnyAsync(c => c.Id != id && c.Nombre.ToLower() == normalizedName.ToLower()))
        {
            throw new InvalidOperationException("Ya existe otra categoría con este nombre.");
        }

        category.Nombre = normalizedName;
        category.Descripcion = dto.Descripcion?.Trim();
        category.Activo = dto.Activo;

        await _context.SaveChangesAsync();

        var count = await _context.Productos.CountAsync(p => p.CategoriaId == category.Id && p.Activo);

        return new CategoryDto(category.Id, category.Nombre, category.Descripcion, category.Activo, count, category.CreadoEn);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var category = await _context.Categorias.FindAsync(id);
        if (category == null)
            throw new KeyNotFoundException("Categoría no encontrada.");

        // Soft delete de categoría
        category.Activo = false;
        await _context.SaveChangesAsync();
        return true;
    }
}
