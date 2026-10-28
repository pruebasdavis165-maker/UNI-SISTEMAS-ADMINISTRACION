using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllAsync(bool? activeOnly = null);
    Task<CategoryDto> GetByIdAsync(Guid id);
    Task<CategoryDto> CreateAsync(CreateCategoryDto dto);
    Task<CategoryDto> UpdateAsync(Guid id, UpdateCategoryDto dto);
    Task<bool> DeleteAsync(Guid id);
}
