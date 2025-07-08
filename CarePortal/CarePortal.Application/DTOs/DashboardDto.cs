namespace CarePortal.Application.DTOs;

public class DashboardStatsDto
{
    public int TotalClients { get; set; }
    public int ActiveClients { get; set; }
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalJobTimes { get; set; }
    public int TodayJobTimes { get; set; }
    public int TotalIncidents { get; set; }
    public int OpenIncidents { get; set; }
    public int TotalDocuments { get; set; }
    public int PendingDocuments { get; set; }
    public double TotalHoursThisWeek { get; set; }
    public double AverageHoursPerDay { get; set; }
}

public class RecentActivityDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public string? RelatedEntityName { get; set; }
    public string? ActivityTypeDisplayName { get; set; }
}

public class DashboardDto
{
    public DashboardStatsDto Stats { get; set; } = new();
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
} 