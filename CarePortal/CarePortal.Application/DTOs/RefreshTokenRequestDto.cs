using System.ComponentModel.DataAnnotations;

namespace CarePortal.Application.DTOs;

public class RefreshTokenRequestDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
} 