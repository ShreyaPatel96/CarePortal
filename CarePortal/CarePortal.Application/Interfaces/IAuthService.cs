using CarePortal.Application.DTOs;

namespace CarePortal.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto request);
    Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);
    Task<bool> ValidateTokenAsync(string token);
    Task<LogoutResponseDto> LogoutAsync(string userId);
} 