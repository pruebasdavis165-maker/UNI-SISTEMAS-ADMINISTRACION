using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync(string? search = null, int? rolId = null);
    Task<UserDto> GetByIdAsync(Guid id);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto);
    Task<bool> ToggleStatusAsync(Guid id);
    Task<IEnumerable<RoleDto>> GetRolesAsync();
}
