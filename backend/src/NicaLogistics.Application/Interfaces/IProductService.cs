using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllAsync(string? search = null, Guid? categoriaId = null, bool? activeOnly = null);
    Task<ProductDto> GetByIdAsync(Guid id);
    Task<ProductDto> CreateAsync(CreateProductDto dto, Guid? userId = null);
    Task<ProductDto> UpdateAsync(Guid id, UpdateProductDto dto);
    Task<bool> DeleteAsync(Guid id);
    Task<ProductDto> ToggleStatusAsync(Guid id);
}
