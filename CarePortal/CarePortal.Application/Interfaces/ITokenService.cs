using CarePortal.Domain.Entities;

namespace CarePortal.Application.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(ApplicationUser user, IList<string> roles);
    string GenerateRefreshToken();
    Task SaveRefreshTokenAsync(string userId, string refreshToken, DateTime expiryDate);
    Task InvalidateRefreshTokensAsync(string userId);
} 