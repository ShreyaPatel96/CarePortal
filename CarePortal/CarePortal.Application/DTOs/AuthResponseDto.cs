namespace CarePortal.Application.DTOs;

public class AuthResponseDto
{
    public bool Success { get; set; }
    public string? Message { get; set; }
    public LoginResponseDto? Data { get; set; }
} 