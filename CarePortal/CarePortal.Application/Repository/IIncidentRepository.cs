using CarePortal.Domain.Entities;
using CarePortal.Domain.Enums;

namespace CarePortal.Application.Repository
{
    public interface IIncidentRepository : IGenericRepository<Incident>
    {
        Task<IEnumerable<Incident>> GetActiveIncidentsAsync();
        Task<IEnumerable<Incident>> GetIncidentsByClientAsync(int clientId);
        Task<IEnumerable<Incident>> GetIncidentsByStaffAsync(string staffId);
        Task<IEnumerable<Incident>> GetIncidentsByStatusAsync(IncidentStatus status);
        Task<IEnumerable<Incident>> GetIncidentsBySeverityAsync(IncidentSeverity severity);
        Task<Incident?> GetIncidentWithDetailsAsync(int id);
        Task<IEnumerable<Incident>> GetIncidentsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<int> GetActiveIncidentsCountAsync();
        Task<int> GetIncidentsCountByStatusAsync(IncidentStatus status);
        Task<IEnumerable<Incident>> GetPagedWithDetailsAsync(int page, int pageSize);
    }
}
