using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<RegisterResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> VerifyOtpAsync(VerifyOtpRequestDto request);
    Task<bool> ResendOtpAsync(string email);
    Task<UserDto> GetCurrentUserAsync(Guid userId);
    Task<bool> RequestPasswordResetAsync(string email);
    Task<bool> ResetPasswordAsync(string email, string token, string newPassword);
}
