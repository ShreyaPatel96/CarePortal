using CarePortal.Domain.Entities;

namespace CarePortal.Application.Repository;

public interface IClientRepository : IGenericRepository<Client>
{
    Task<IEnumerable<Client>> GetClientsByStaffAsync(string staffId);
    Task<Client?> GetClientWithDetailsAsync(int id);
    Task<IEnumerable<Client>> SearchClientsAsync(string searchTerm);
    Task<int> GetActiveClientsCountAsync();
    Task<IEnumerable<Client>> GetPagedAsync(int pageNumber, int pageSize);
}
