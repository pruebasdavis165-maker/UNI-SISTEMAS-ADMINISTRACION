using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface ISedeService
{
    Task<IEnumerable<SedeDto>> GetAllAsync(bool? activeOnly = null);
    Task<SedeDto> GetByIdAsync(Guid id);
    Task<SedeDto> CreateAsync(CreateSedeDto dto);
    Task<SedeDto> UpdateAsync(Guid id, UpdateSedeDto dto);
    Task<bool> ToggleStatusAsync(Guid id);
    Task<bool> DeleteAsync(Guid id);
}
