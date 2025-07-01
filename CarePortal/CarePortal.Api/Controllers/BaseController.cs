using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CarePortal.Api.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected string? CurrentUserId => User.FindFirst("sub")?.Value ?? User.FindFirst("userId")?.Value;
    protected string? CurrentUserEmail => User.FindFirst(ClaimTypes.Email)?.Value;
    protected string? CurrentUsername => User.FindFirst(ClaimTypes.Name)?.Value;
    protected bool IsInRole(string role) => User.IsInRole(role);
    protected bool IsAdmin => User.IsInRole("Admin");
    protected bool HasValidCurrentUser() => !string.IsNullOrEmpty(CurrentUserId);
    protected string? CurrentUserFullName
    {
        get
        {
            var firstName = User.FindFirst("firstName")?.Value;
            var lastName = User.FindFirst("lastName")?.Value;
            
            if (!string.IsNullOrEmpty(firstName) && !string.IsNullOrEmpty(lastName))
                return $"{firstName} {lastName}";
            
            return User.FindFirst(ClaimTypes.Name)?.Value;
        }
    }
}