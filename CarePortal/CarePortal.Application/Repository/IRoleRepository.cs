using CarePortal.Domain.Entities;

namespace CarePortal.Application.Repository;

public interface IRoleRepository : IGenericRepository<ApplicationRole>
{
    Task<IEnumerable<ApplicationRole>> GetActiveRolesAsync();
    Task<ApplicationRole?> GetRoleByNameAsync(string name);
    Task<IEnumerable<ApplicationRole>> SearchRolesAsync(string searchTerm);
    Task<int> GetActiveRolesCountAsync();
}
