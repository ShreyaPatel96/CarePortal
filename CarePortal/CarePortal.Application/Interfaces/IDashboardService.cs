using CarePortal.Application.DTOs;

namespace CarePortal.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync();
    Task<DashboardStatsDto> GetStatsAsync();
    Task<List<RecentActivityDto>> GetRecentActivitiesAsync(int count = 10);
    Task<DashboardDto> GetDashboardByStaffAsync(string staffId);
    Task<DashboardDto> GetDashboardByClientAsync(int clientId);
} 