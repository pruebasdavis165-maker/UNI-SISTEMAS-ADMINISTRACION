using NicaLogistics.Domain.Entities;

namespace NicaLogistics.Application.Interfaces;

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, string roleName);
}
