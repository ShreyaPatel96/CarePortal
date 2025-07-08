using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarePortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : BaseController
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<DashboardDto>> GetDashboard()
    {
        if (IsAdmin)
            return Ok(await _dashboardService.GetDashboardAsync());
        if (!HasValidCurrentUser()) return Forbid();
        return Ok(await _dashboardService.GetDashboardByStaffAsync(CurrentUserId!));
    }

    [HttpGet("stats")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        if (IsAdmin)
            return Ok(await _dashboardService.GetStatsAsync());
        if (!HasValidCurrentUser()) return Forbid();
        return Ok(await _dashboardService.GetDashboardByStaffAsync(CurrentUserId!));
    }

    [HttpGet("recent-activities")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<List<RecentActivityDto>>> GetRecentActivities([FromQuery] int count = 10)
    {
        return Ok(await _dashboardService.GetRecentActivitiesAsync(count));
    }
} 