using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<UserDto> GetCurrentUserAsync(Guid userId);
}
