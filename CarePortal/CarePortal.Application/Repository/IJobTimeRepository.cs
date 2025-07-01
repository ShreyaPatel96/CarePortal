using CarePortal.Domain.Entities;
using CarePortal.Domain.Enums;

namespace CarePortal.Application.Repository;

public interface IJobTimeRepository : IGenericRepository<JobTime>
{
    Task<IEnumerable<JobTime>> GetActiveJobTimesAsync();
    Task<IEnumerable<JobTime>> GetJobTimesByClientAsync(int clientId);
    Task<IEnumerable<JobTime>> GetJobTimesByStaffAsync(string staffId);
    Task<IEnumerable<JobTime>> GetJobTimesByActivityTypeAsync(ActivityType activityType);
    Task<IEnumerable<JobTime>> GetCompletedJobTimesAsync();
    Task<IEnumerable<JobTime>> GetOngoingJobTimesAsync();
    Task<JobTime?> GetJobTimeWithDetailsAsync(int id);
    Task<IEnumerable<JobTime>> GetJobTimesByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<TimeSpan> GetTotalDurationByStaffAsync(string staffId, DateTime startDate, DateTime endDate);
    Task<int> GetActiveJobTimesCountAsync();
    Task<int> GetCompletedJobTimesCountAsync();
    Task<IEnumerable<JobTime>> GetPagedWithDetailsAsync(int page, int pageSize);
}
