using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarePortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : BaseController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.LoginAsync(request);
        
        if (result?.Success == true)
        {
            return Ok(result);
        }

        return Unauthorized(result);
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.RefreshTokenAsync(request);
        
        if (result?.Success == true)
        {
            return Ok(result);
        }

        return Unauthorized(result);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult<LogoutResponseDto>> Logout()
    {
        try
        {
            if (!HasValidCurrentUser())
            {
                return BadRequest(new LogoutResponseDto
                {
                    Success = false,
                    Message = "User not authenticated"
                });
            }

            var result = await _authService.LogoutAsync(CurrentUserId!);
            
            if (result.Success)
            {
                return Ok(result);
            }

            return BadRequest(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new LogoutResponseDto
            {
                Success = false,
                Message = "An error occurred during logout"
            });
        }
    }
} 