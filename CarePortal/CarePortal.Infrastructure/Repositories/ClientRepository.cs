using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using CarePortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace CarePortal.Infrastructure.Repositories;

public class ClientRepository : GenericRepository<Client>, IClientRepository
{
    public ClientRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Client>> GetActiveClientsAsync()
    {
        return await _dbSet
            .Where(c => c.IsActive && !c.IsDeleted)
            .Include(c => c.AssignedStaff)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync();
    }

    public async Task<IEnumerable<Client>> GetClientsByStaffAsync(string staffId)
    {
        return await _dbSet
            .Where(c => c.AssignedStaffId == staffId && c.IsActive && !c.IsDeleted)
            .Include(c => c.AssignedStaff)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync();
    }

    public async Task<Client?> GetClientWithDetailsAsync(int id)
    {
        return await _dbSet
            .Where(c => c.Id == id && !c.IsDeleted)
            .Include(c => c.AssignedStaff)
            .Include(c => c.Documents)
            .Include(c => c.JobTimes)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Client>> SearchClientsAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        return await _dbSet
            .Where(c => !c.IsDeleted && 
                       (c.FirstName.ToLower().Contains(term) ||
                        c.LastName.ToLower().Contains(term) ||
                        c.Email.ToLower().Contains(term) ||
                        c.PhoneNumber.Contains(term)))
            .Include(c => c.AssignedStaff)
            .OrderBy(c => c.FirstName)
            .ThenBy(c => c.LastName)
            .ToListAsync();
    }

    public async Task<int> GetActiveClientsCountAsync()
    {
        return await _dbSet
            .Where(c => c.IsActive && !c.IsDeleted)
            .CountAsync();
    }
} 