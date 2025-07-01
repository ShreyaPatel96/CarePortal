using CarePortal.Application.Interfaces;
using CarePortal.Domain.Entities;
using CarePortal.Shared.Constants;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CarePortal.Persistence.Context;

namespace CarePortal.Infrastructure.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;

    public TokenService(
        IConfiguration configuration,
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext context)
    {
        _configuration = configuration;
        _userManager = userManager;
        _context = context;
    }

    public string GenerateJwtToken(ApplicationUser user, IList<string> roles)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured"));
        var issuer = jwtSettings["Issuer"] ?? "CarePortal";
        var audience = jwtSettings["Audience"] ?? "CarePortal";
        var expiresInMinutes = int.Parse(jwtSettings["ExpiresInMinutes"] ?? "60");

        var claims = new List<Claim>
        {
            new(Claims.UserId, user.Id),
            new(Claims.Email, user.Email ?? string.Empty),
            new(Claims.FirstName, user.FirstName),
            new(Claims.LastName, user.LastName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        // Add roles to claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(Claims.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(expiresInMinutes),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public async Task<bool> ValidateRefreshTokenAsync(string refreshToken, string userId)
    {
        // In a real application, you would store refresh tokens in a separate table
        // For this example, we'll use a simple in-memory approach
        // You should implement proper refresh token storage and validation
        return true; // Placeholder implementation
    }

    public async Task SaveRefreshTokenAsync(string userId, string refreshToken, DateTime expiryDate)
    {
        // In a real application, you would save the refresh token to a database
        // For this example, we'll use a simple in-memory approach
        // You should implement proper refresh token storage
        await Task.CompletedTask; // Placeholder implementation
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        // In a real application, you would mark the refresh token as revoked in the database
        // For this example, we'll use a simple in-memory approach
        // You should implement proper refresh token revocation
        await Task.CompletedTask; // Placeholder implementation
    }

    public async Task InvalidateRefreshTokensAsync(string userId)
    {
        // In a real application, you would mark all refresh tokens for this user as revoked in the database
        // For this example, we'll use a simple in-memory approach
        // You should implement proper refresh token invalidation for all user tokens
        await Task.CompletedTask; // Placeholder implementation
    }
} 