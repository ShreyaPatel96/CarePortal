using CarePortal.Domain.Entities;

namespace CarePortal.Application.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(ApplicationUser user, IList<string> roles);
    string GenerateRefreshToken();
    Task<bool> ValidateRefreshTokenAsync(string refreshToken, string userId);
    Task SaveRefreshTokenAsync(string userId, string refreshToken, DateTime expiryDate);
    Task RevokeRefreshTokenAsync(string refreshToken);
    Task InvalidateRefreshTokensAsync(string userId);
} 