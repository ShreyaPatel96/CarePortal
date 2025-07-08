using CarePortal.Domain.Entities;
using CarePortal.Domain.Enums;

namespace CarePortal.Application.Repository;

public interface IJobTimeRepository : IGenericRepository<JobTime>
{
    Task<IEnumerable<JobTime>> GetJobTimesByClientAsync(int clientId);
    Task<IEnumerable<JobTime>> GetJobTimesByStaffAsync(string staffId);
    Task<JobTime?> GetJobTimeWithDetailsAsync(int id);
    Task<int> GetActiveJobTimesCountAsync();
    Task<IEnumerable<JobTime>> GetPagedWithDetailsAsync(int page, int pageSize);
}
