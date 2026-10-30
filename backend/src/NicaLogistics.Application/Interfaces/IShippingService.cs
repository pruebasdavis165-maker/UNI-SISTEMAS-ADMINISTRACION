using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface IShippingService
{
    Task<IEnumerable<FormaEnvioDto>> GetFormasEnvioAsync(bool? activeOnly = null);
    Task<FormaEnvioDto> GetFormaEnvioByIdAsync(Guid id);
    Task<FormaEnvioDto> CreateFormaEnvioAsync(CreateFormaEnvioDto dto);
    Task<FormaEnvioDto> UpdateFormaEnvioAsync(Guid id, UpdateFormaEnvioDto dto);
    Task<IEnumerable<OpcionEnvioDto>> CotizarRutaAsync(CotizarEnvioRequestDto request);
}
