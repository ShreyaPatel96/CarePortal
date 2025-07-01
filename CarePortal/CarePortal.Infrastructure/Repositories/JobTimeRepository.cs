using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using CarePortal.Domain.Enums;
using CarePortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace CarePortal.Infrastructure.Repositories;

public class JobTimeRepository : GenericRepository<JobTime>, IJobTimeRepository
{
    public JobTimeRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<JobTime>> GetActiveJobTimesAsync()
    {
        return await _dbSet
            .Where(j => j.IsActive && !j.IsDeleted)
            .Include(j => j.Client)
            .Include(j => j.Staff)
            .OrderByDescending(j => j.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<JobTime>> GetJobTimesByClientAsync(int clientId)
    {
        return await _dbSet
            .Where(j => j.ClientId == clientId && !j.IsDeleted)
            .Include(j => j.Client)
            .Include(j => j.Staff)
            .OrderByDescending(j => j.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<JobTime>> GetJobTimesByStaffAsync(string staffId)
    {
        return await _dbSet
            .Where(j => j.StaffId == staffId && !j.IsDeleted)
            .Include(j => j.Client)
            .Include(j => j.Staff)
            .OrderByDescending(j => j.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<JobTime>> GetJobTimesByActivityTypeAsync(ActivityType activityType)
    {
        return await _dbSet
            .Where(j => j.ActivityType == activityType && !j.IsDeleted)
            .Include(j => j.Client)
            .Include(j => j.Staff)
            .OrderByDescending(j => j.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<JobTime>> GetCompletedJobTimesAsync()
    {
        return await _dbSet
            .Where(j => j.EndTime.HasValue && !j.IsDeleted)
            .Include(j => j.Client)
            .Include(j => j.Staff)
            .OrderByDescending(j => j.StartTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<JobTime>> GetOngoingJobTimesAsync()
    {
        return await _dbSet
            .Where(j => !j.EndTime.HasValue && j.IsActive && !j.IsDeleted)
            .Include(j => j.Client)
            .Include(j => j.Staff)
            .OrderByDescending(j => j.StartTime)
            .ToListAsync();
    }

    public async Task<JobTime?> GetJobTimeWithDetailsAsync(int id)
    {
        return await _dbSet
            .Where(j => j.Id == id && !j.IsDeleted)
            .Include(j => j.Client)
            .Include(j => j.Staff)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<JobTime>> GetJobTimesByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Where(j => j.StartTime >= startDate && j.StartTime <= endDate && !j.IsDeleted)
            .Include(j => j.Client)
            .Include(j => j.Staff)
            .OrderByDescending(j => j.StartTime)
            .ToListAsync();
    }

    public async Task<TimeSpan> GetTotalDurationByStaffAsync(string staffId, DateTime startDate, DateTime endDate)
    {
        var jobTimes = await _dbSet
            .Where(j => j.StaffId == staffId && 
                       j.StartTime >= startDate && 
                       j.StartTime <= endDate && 
                       j.EndTime.HasValue && 
                       !j.IsDeleted)
            .ToListAsync();

        var totalTicks = jobTimes.Sum(j => j.Duration?.Ticks ?? 0);
        return TimeSpan.FromTicks(totalTicks);
    }

    public async Task<int> GetActiveJobTimesCountAsync()
    {
        return await _dbSet
            .Where(j => j.IsActive && !j.IsDeleted)
            .CountAsync();
    }

    public async Task<int> GetCompletedJobTimesCountAsync()
    {
        return await _dbSet
            .Where(j => j.EndTime.HasValue && !j.IsDeleted)
            .CountAsync();
    }

    public async Task<IEnumerable<JobTime>> GetPagedWithDetailsAsync(int page, int pageSize)
    {
        return await _dbSet
            .Where(j => j.IsActive && !j.IsDeleted)
            .Include(j => j.Client)
            .Include(j => j.Staff)
            .OrderByDescending(j => j.StartTime)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
} 