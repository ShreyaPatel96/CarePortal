using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using CarePortal.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace CarePortal.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public DashboardService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var stats = await GetStatsAsync();
        var recentActivities = await GetRecentActivitiesAsync();

        return new DashboardDto
        {
            Stats = stats,
            RecentActivities = recentActivities
        };
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        var clients = _unitOfWork.Repository<Client>().GetAll().ToList();
        var users = _userManager.Users.ToList();
        var jobTimes = _unitOfWork.Repository<JobTime>().GetAll().ToList();
        var incidents = _unitOfWork.Repository<Incident>().GetAll().ToList();
        var documents = _unitOfWork.Repository<ClientDocument>().GetAll().ToList();

        var totalClients = clients.Count;
        var activeClients = clients.Count(c => c.IsActive);
        var totalUsers = users.Count;
        var activeUsers = users.Count(u => u.IsActive);
        var totalJobTimes = jobTimes.Count;
        var todayJobTimes = jobTimes.Count(j => j.StartTime.Date == DateTime.Today);
        var totalIncidents = incidents.Count;
        var openIncidents = incidents.Count(i => i.Status == IncidentStatus.Open);
        var totalDocuments = documents.Count;
        var pendingDocuments = documents.Count(d => d.Status == "pending");

        // Calculate hours
        var completedJobs = jobTimes.Where(j => j.EndTime.HasValue).ToList();

        var totalHoursThisWeek = completedJobs
            .Where(j => j.StartTime >= DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek))
            .Sum(j => (j.EndTime!.Value - j.StartTime).TotalHours);

        var averageHoursPerDay = totalJobTimes > 0 ? totalHoursThisWeek / 7 : 0;

        return new DashboardStatsDto
        {
            TotalClients = totalClients,
            ActiveClients = activeClients,
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalJobTimes = totalJobTimes,
            TodayJobTimes = todayJobTimes,
            TotalIncidents = totalIncidents,
            OpenIncidents = openIncidents,
            TotalDocuments = totalDocuments,
            PendingDocuments = pendingDocuments,
            TotalHoursThisWeek = totalHoursThisWeek,
            AverageHoursPerDay = averageHoursPerDay
        };
    }

    public async Task<List<RecentActivityDto>> GetRecentActivitiesAsync(int count = 10)
    {
        var activities = new List<RecentActivityDto>();

        // Get recent job times
        var recentJobTimes = _unitOfWork.Repository<JobTime>().GetAll()
            .OrderByDescending(j => j.CreatedAt)
            .Take(count / 2)
            .ToList();

        foreach (var jobTime in recentJobTimes)
        {
            var client = await _unitOfWork.Repository<Client>().GetByIdAsync(jobTime.ClientId);
            var staff = await _userManager.FindByIdAsync(jobTime.StaffId);

            activities.Add(new RecentActivityDto
            {
                Id = jobTime.Id.ToString(),
                Type = "job_time",
                Title = $"Job logged for {client?.FirstName} {client?.LastName}",
                Description = jobTime.ActivityType.GetDisplayName(),
                CreatedAt = jobTime.CreatedAt,
                CreatedBy = staff != null ? $"{staff.FirstName} {staff.LastName}" : "Unknown Staff",
                RelatedEntityName = client != null ? $"{client.FirstName} {client.LastName}" : "Unknown Client",
                ActivityTypeDisplayName = jobTime.ActivityType.GetDisplayName()
            });
        }

        // Get recent incidents
        var recentIncidents = _unitOfWork.Repository<Incident>().GetAll()
            .OrderByDescending(i => i.CreatedAt)
            .Take(count / 2)
            .ToList();

        foreach (var incident in recentIncidents)
        {
            var client = await _unitOfWork.Repository<Client>().GetByIdAsync(incident.ClientId);
            var staff = await _userManager.FindByIdAsync(incident.StaffId.ToString());

            activities.Add(new RecentActivityDto
            {
                Id = incident.Id.ToString(),
                Type = "incident",
                Title = incident.Title,
                Description = incident.Description,
                CreatedAt = incident.CreatedAt,
                CreatedBy = staff != null ? $"{staff.FirstName} {staff.LastName}" : "Unknown Staff",
                RelatedEntityName = client != null ? $"{client.FirstName} {client.LastName}" : "Unknown Client"
            });
        }

        // Get recent documents
        var recentDocuments = _unitOfWork.Repository<ClientDocument>().GetAll()
            .OrderByDescending(d => d.CreatedAt)
            .Take(count / 4)
            .ToList();

        foreach (var document in recentDocuments)
        {
            var client = await _unitOfWork.Repository<Client>().GetByIdAsync(document.ClientId);

            activities.Add(new RecentActivityDto
            {
                Id = document.Id.ToString(),
                Type = "document",
                Title = $"Document uploaded: {document.Title}",
                Description = document.Description,
                CreatedAt = document.CreatedAt,
                CreatedBy = document.UploadedBy,
                RelatedEntityName = client != null ? $"{client.FirstName} {client.LastName}" : "Unknown Client"
            });
        }

        // Get recent clients
        var recentClients = _unitOfWork.Repository<Client>().GetAll()
            .OrderByDescending(c => c.CreatedAt)
            .Take(count / 4)
            .ToList();

        foreach (var client in recentClients)
        {
            activities.Add(new RecentActivityDto
            {
                Id = client.Id.ToString(),
                Type = "client",
                Title = $"New client added: {client.FirstName} {client.LastName}",
                Description = $"Client created with email: {client.Email}",
                CreatedAt = client.CreatedAt,
                CreatedBy = "System",
                RelatedEntityName = $"{client.FirstName} {client.LastName}"
            });
        }

        return activities
            .OrderByDescending(a => a.CreatedAt)
            .Take(count)
            .ToList();
    }

    public async Task<DashboardDto> GetDashboardByStaffAsync(string staffId)
    {
        var stats = await GetStatsAsync();
        var recentActivities = await GetRecentActivitiesAsync();

        // Filter activities for specific staff
        var staffActivities = recentActivities
            .Where(a => a.CreatedBy.Contains(staffId) || a.Type == "job_time")
            .Take(10)
            .ToList();

        return new DashboardDto
        {
            Stats = stats,
            RecentActivities = staffActivities
        };
    }

    public async Task<DashboardDto> GetDashboardByClientAsync(int clientId)
    {
        var stats = await GetStatsAsync();
        var recentActivities = await GetRecentActivitiesAsync();

        // Filter activities for specific client
        var clientActivities = recentActivities
            .Where(a => a.RelatedEntityName != null && a.RelatedEntityName.Contains(clientId.ToString()))
            .Take(10)
            .ToList();

        return new DashboardDto
        {
            Stats = stats,
            RecentActivities = clientActivities
        };
    }
} 