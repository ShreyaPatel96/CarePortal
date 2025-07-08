using CarePortal.Domain.Entities;
using CarePortal.Domain.Enums;

namespace CarePortal.Application.Repository
{
    public interface IIncidentRepository : IGenericRepository<Incident>
    {
        Task<IEnumerable<Incident>> GetIncidentsByStatusAsync(IncidentStatus status);
        Task<IEnumerable<Incident>> GetIncidentsBySeverityAsync(IncidentSeverity severity);
        Task<Incident?> GetIncidentWithDetailsAsync(int id);
        Task<int> GetActiveIncidentsCountAsync();
        Task<IEnumerable<Incident>> GetPagedWithDetailsAsync(int page, int pageSize);
    }
}
