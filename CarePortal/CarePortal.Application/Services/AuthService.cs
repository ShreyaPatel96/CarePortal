using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using CarePortal.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace CarePortal.Application.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Invalid email or password"
            };
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            return new AuthResponseDto
            {
                Success = false,
                Message = "Invalid email or password"
            };
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);

        // Generate tokens
        var accessToken = _tokenService.GenerateJwtToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(60); // Should match JWT expiration

        // Save refresh token (in a real app, you'd store this in a database)
        await _tokenService.SaveRefreshTokenAsync(user.Id, refreshToken, expiresAt);

        var userInfo = new UserDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = roles.FirstOrDefault() ?? string.Empty,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };

        var loginResponse = new LoginResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            User = userInfo
        };

        return new AuthResponseDto
        {
            Success = true,
            Message = "Login successful",
            Data = loginResponse
        };
    }

    public async Task<AuthResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request)
    {
        return new AuthResponseDto
        {
            Success = false,
            Message = "Refresh token validation not implemented in this example"
        };
    }

    public async Task<bool> ValidateTokenAsync(string token)
    {
        return true; // Placeholder implementation
    }

    public async Task<LogoutResponseDto> LogoutAsync(string userId)
    {
        try
        {
            // Invalidate refresh tokens for the user
            await _tokenService.InvalidateRefreshTokensAsync(userId);
            
            // Sign out the user
            await _signInManager.SignOutAsync();

            return new LogoutResponseDto
            {
                Success = true,
                Message = "Logout successful"
            };
        }
        catch (Exception ex)
        {
            return new LogoutResponseDto
            {
                Success = false,
                Message = "An error occurred during logout"
            };
        }
    }
} 