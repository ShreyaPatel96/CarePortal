using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace CarePortal.Application.Services;

public class JobTimeService : IJobTimeService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public JobTimeService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<JobTimeDto?> GetByIdAsync(int id)
    {
        var jobTime = await _unitOfWork.JobTimes.GetJobTimeWithDetailsAsync(id);

        if (jobTime == null) return null;

        return new JobTimeDto
        {
            Id = jobTime.Id,
            ClientId = jobTime.ClientId,
            ClientName = jobTime.Client?.FullName ?? "Unknown Client",
            StaffId = jobTime.StaffId,
            StaffName = jobTime.Staff?.FullName ?? "Unknown Staff",
            StartTime = jobTime.StartTime,
            EndTime = jobTime.EndTime,
            ActivityType = jobTime.ActivityType,
            Notes = jobTime.Notes,
            CreatedAt = jobTime.CreatedAt,
            UpdatedAt = jobTime.UpdatedAt,
            IsActive = jobTime.IsActive
        };
    }

    public async Task<JobTimeListDto> GetAllAsync(int pageNumber = 1, int pageSize = 10, string? staffId = null, int? clientId = null)
    {
        IEnumerable<JobTime> jobTimes;
        int totalCount;

        if (!string.IsNullOrEmpty(staffId) && clientId.HasValue)
        {
            var staffJobTimes = await _unitOfWork.JobTimes.GetJobTimesByStaffAsync(staffId);
            jobTimes = staffJobTimes.Where(j => j.ClientId == clientId.Value);
            totalCount = jobTimes.Count();
            jobTimes = jobTimes
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }
        else if (!string.IsNullOrEmpty(staffId))
        {
            jobTimes = await _unitOfWork.JobTimes.GetJobTimesByStaffAsync(staffId);
            totalCount = jobTimes.Count();
            jobTimes = jobTimes
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }
        else if (clientId.HasValue)
        {
            jobTimes = await _unitOfWork.JobTimes.GetJobTimesByClientAsync(clientId.Value);
            totalCount = jobTimes.Count();
            jobTimes = jobTimes
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }
        else
        {
            totalCount = await _unitOfWork.JobTimes.GetActiveJobTimesCountAsync();
            jobTimes = await _unitOfWork.JobTimes.GetPagedWithDetailsAsync(pageNumber, pageSize);
        }

        var jobTimeDtos = jobTimes.Select(jobTime => new JobTimeDto
        {
            Id = jobTime.Id,
            ClientId = jobTime.ClientId,
            ClientName = jobTime.Client?.FullName ?? "Unknown Client",
            StaffId = jobTime.StaffId,
            StaffName = jobTime.Staff?.FullName ?? "Unknown Staff",
            StartTime = jobTime.StartTime,
            EndTime = jobTime.EndTime,
            ActivityType = jobTime.ActivityType,
            Notes = jobTime.Notes,
            CreatedAt = jobTime.CreatedAt,
            UpdatedAt = jobTime.UpdatedAt,
            IsActive = jobTime.IsActive
        }).ToList();

        return new JobTimeListDto
        {
            JobTimes = jobTimeDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<JobTimeDto> CreateAsync(CreateJobTimeDto createJobTimeDto, string? currentUserId = null)
    {
        var jobTime = new JobTime
        {
            ClientId = createJobTimeDto.ClientId,
            StaffId = createJobTimeDto.StaffId,
            StartTime = createJobTimeDto.StartTime,
            EndTime = createJobTimeDto.EndTime,
            ActivityType = createJobTimeDto.ActivityType,
            Notes = createJobTimeDto.Notes,
            IsActive = createJobTimeDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserId,
        };

        await _unitOfWork.JobTimes.AddAsync(jobTime);

        return await GetByIdAsync(jobTime.Id) ?? throw new InvalidOperationException("Failed to retrieve created job time");
    }

    public async Task<JobTimeDto> UpdateAsync(int id, UpdateJobTimeDto updateJobTimeDto, string? currentUserId = null)
    {
        var jobTime = await _unitOfWork.JobTimes.GetByIdAsync(id);
        if (jobTime == null)
            throw new InvalidOperationException("Job time not found");

        if (updateJobTimeDto.StartTime.HasValue)
            jobTime.StartTime = updateJobTimeDto.StartTime.Value;

        if (updateJobTimeDto.EndTime.HasValue)
            jobTime.EndTime = updateJobTimeDto.EndTime.Value;

        if (updateJobTimeDto.ActivityType.HasValue)
            jobTime.ActivityType = updateJobTimeDto.ActivityType.Value;

        if (!string.IsNullOrEmpty(updateJobTimeDto.Notes))
            jobTime.Notes = updateJobTimeDto.Notes;

        if (updateJobTimeDto.IsActive.HasValue)
            jobTime.IsActive = updateJobTimeDto.IsActive.Value;

        jobTime.UpdatedAt = DateTime.UtcNow;
        jobTime.UpdatedBy = currentUserId;

        await _unitOfWork.JobTimes.UpdateAsync(jobTime);

        return await GetByIdAsync(id) ?? throw new InvalidOperationException("Failed to retrieve updated job time");
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var jobTime = await _unitOfWork.JobTimes.GetByIdAsync(id);
        if (jobTime == null) return false;

        await _unitOfWork.JobTimes.DeleteAsync(jobTime);
        return true;
    }

    public async Task<bool> CompleteJobAsync(int id, DateTime endTime, string? currentUserId = null)
    {
        var jobTime = await _unitOfWork.JobTimes.GetByIdAsync(id);
        if (jobTime == null) return false;

        jobTime.EndTime = endTime;
        jobTime.UpdatedAt = DateTime.UtcNow;
        jobTime.UpdatedBy = currentUserId;

        await _unitOfWork.JobTimes.UpdateAsync(jobTime);
        return true;
    }

    public async Task<List<JobTimeDto>> GetByClientAsync(int clientId)
    {
        var jobTimes = await _unitOfWork.JobTimes.GetJobTimesByClientAsync(clientId);

        return jobTimes.Select(jobTime => new JobTimeDto
        {
            Id = jobTime.Id,
            ClientId = jobTime.ClientId,
            ClientName = jobTime.Client?.FullName ?? "Unknown Client",
            StaffId = jobTime.StaffId,
            StaffName = jobTime.Staff?.FullName ?? "Unknown Staff",
            StartTime = jobTime.StartTime,
            EndTime = jobTime.EndTime,
            ActivityType = jobTime.ActivityType,
            Notes = jobTime.Notes,
            CreatedAt = jobTime.CreatedAt,
            UpdatedAt = jobTime.UpdatedAt,
            IsActive = jobTime.IsActive
        }).ToList();
    }

    public async Task<List<JobTimeDto>> GetByStaffAsync(string staffId)
    {
        var jobTimes = await _unitOfWork.JobTimes.GetJobTimesByStaffAsync(staffId);

        return jobTimes.Select(jobTime => new JobTimeDto
        {
            Id = jobTime.Id,
            ClientId = jobTime.ClientId,
            ClientName = jobTime.Client?.FullName ?? "Unknown Client",
            StaffId = jobTime.StaffId,
            StaffName = jobTime.Staff?.FullName ?? "Unknown Staff",
            StartTime = jobTime.StartTime,
            EndTime = jobTime.EndTime,
            ActivityType = jobTime.ActivityType,
            Notes = jobTime.Notes,
            CreatedAt = jobTime.CreatedAt,
            UpdatedAt = jobTime.UpdatedAt,
            IsActive = jobTime.IsActive
        }).ToList();
    }

    public async Task<List<JobTimeDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var jobTimes = await _unitOfWork.JobTimes.GetJobTimesByDateRangeAsync(startDate, endDate);

        return jobTimes.Select(jobTime => new JobTimeDto
        {
            Id = jobTime.Id,
            ClientId = jobTime.ClientId,
            ClientName = jobTime.Client?.FullName ?? "Unknown Client",
            StaffId = jobTime.StaffId,
            StaffName = jobTime.Staff?.FullName ?? "Unknown Staff",
            StartTime = jobTime.StartTime,
            EndTime = jobTime.EndTime,
            ActivityType = jobTime.ActivityType,
            Notes = jobTime.Notes,
            CreatedAt = jobTime.CreatedAt,
            UpdatedAt = jobTime.UpdatedAt,
            IsActive = jobTime.IsActive
        }).ToList();
    }

    public async Task<JobTimeStatsDto> GetStatsAsync()
    {
        var totalJobTimes = await _unitOfWork.JobTimes.CountAsync();
        var activeJobTimes = await _unitOfWork.JobTimes.GetActiveJobTimesCountAsync();
        var completedJobTimes = await _unitOfWork.JobTimes.GetCompletedJobTimesCountAsync();
        var ongoingJobTimes = await _unitOfWork.JobTimes.GetActiveJobTimesCountAsync() - completedJobTimes;

        return new JobTimeStatsDto
        {
            TotalJobTimes = totalJobTimes,
            ActiveJobTimes = activeJobTimes,
            CompletedJobTimes = completedJobTimes,
            OngoingJobTimes = ongoingJobTimes
        };
    }

    public async Task<JobTimeStatsDto> GetStatsByStaffAsync(string staffId)
    {
        var jobTimes = await _unitOfWork.JobTimes.GetJobTimesByStaffAsync(staffId);
        var totalJobTimes = jobTimes.Count();
        var activeJobTimes = jobTimes.Count(j => j.IsActive);
        var completedJobTimes = jobTimes.Count(j => j.IsCompleted);
        var ongoingJobTimes = jobTimes.Count(j => !j.IsCompleted && j.IsActive);

        return new JobTimeStatsDto
        {
            TotalJobTimes = totalJobTimes,
            ActiveJobTimes = activeJobTimes,
            CompletedJobTimes = completedJobTimes,
            OngoingJobTimes = ongoingJobTimes
        };
    }

    public async Task<JobTimeStatsDto> GetStatsByClientAsync(int clientId)
    {
        var jobTimes = await _unitOfWork.JobTimes.GetJobTimesByClientAsync(clientId);
        var totalJobTimes = jobTimes.Count();
        var activeJobTimes = jobTimes.Count(j => j.IsActive);
        var completedJobTimes = jobTimes.Count(j => j.IsCompleted);
        var ongoingJobTimes = jobTimes.Count(j => !j.IsCompleted && j.IsActive);

        return new JobTimeStatsDto
        {
            TotalJobTimes = totalJobTimes,
            ActiveJobTimes = activeJobTimes,
            CompletedJobTimes = completedJobTimes,
            OngoingJobTimes = ongoingJobTimes
        };
    }
} 