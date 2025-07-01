using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using CarePortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace CarePortal.Infrastructure.Repositories;

public class RoleRepository : GenericRepository<ApplicationRole>, IRoleRepository
{
    public RoleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<ApplicationRole>> GetActiveRolesAsync()
    {
        return await _dbSet
            .Where(r => r.IsActive && !r.IsDeleted)
            .OrderBy(r => r.Name)
            .ToListAsync();
    }

    public async Task<ApplicationRole?> GetRoleByNameAsync(string name)
    {
        return await _dbSet
            .Where(r => r.Name == name && !r.IsDeleted)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<ApplicationRole>> SearchRolesAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        return await _dbSet
            .Where(r => !r.IsDeleted && 
                       (r.Name!.ToLower().Contains(term) ||
                        r.Description.ToLower().Contains(term)))
            .OrderBy(r => r.Name)
            .ToListAsync();
    }

    public async Task<int> GetActiveRolesCountAsync()
    {
        return await _dbSet
            .Where(r => r.IsActive && !r.IsDeleted)
            .CountAsync();
    }
} 