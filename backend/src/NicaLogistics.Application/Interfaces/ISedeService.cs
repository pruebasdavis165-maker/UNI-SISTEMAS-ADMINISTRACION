using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface ISedeService
{
    Task<IEnumerable<SedeDto>> GetAllAsync(bool? activeOnly = null);
    Task<SedeDto> GetByIdAsync(Guid id);
}
