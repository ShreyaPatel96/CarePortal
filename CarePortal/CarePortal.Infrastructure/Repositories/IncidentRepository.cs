using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using CarePortal.Domain.Enums;
using CarePortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace CarePortal.Infrastructure.Repositories;

public class IncidentRepository : GenericRepository<Incident>, IIncidentRepository
{
    public IncidentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Incident>> GetActiveIncidentsAsync()
    {
        return await _dbSet
            .Where(i => i.IsActive && !i.IsDeleted)
            .Include(i => i.Client)
            .Include(i => i.Staff)
            .OrderByDescending(i => i.IncidentDate)
            .ThenByDescending(i => i.IncidentTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Incident>> GetIncidentsByClientAsync(int clientId)
    {
        return await _dbSet
            .Where(i => i.ClientId == clientId && !i.IsDeleted)
            .Include(i => i.Client)
            .Include(i => i.Staff)
            .OrderByDescending(i => i.IncidentDate)
            .ThenByDescending(i => i.IncidentTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Incident>> GetIncidentsByStaffAsync(string staffId)
    {
        return await _dbSet
            .Where(i => i.StaffId == staffId && !i.IsDeleted)
            .Include(i => i.Client)
            .Include(i => i.Staff)
            .OrderByDescending(i => i.IncidentDate)
            .ThenByDescending(i => i.IncidentTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Incident>> GetIncidentsByStatusAsync(IncidentStatus status)
    {
        return await _dbSet
            .Where(i => i.Status == status && !i.IsDeleted)
            .Include(i => i.Client)
            .Include(i => i.Staff)
            .OrderByDescending(i => i.IncidentDate)
            .ThenByDescending(i => i.IncidentTime)
            .ToListAsync();
    }

    public async Task<IEnumerable<Incident>> GetIncidentsBySeverityAsync(IncidentSeverity severity)
    {
        return await _dbSet
            .Where(i => i.Severity == severity && !i.IsDeleted)
            .Include(i => i.Client)
            .Include(i => i.Staff)
            .OrderByDescending(i => i.IncidentDate)
            .ThenByDescending(i => i.IncidentTime)
            .ToListAsync();
    }

    public async Task<Incident?> GetIncidentWithDetailsAsync(int id)
    {
        return await _dbSet
            .Where(i => i.Id == id && !i.IsDeleted)
            .Include(i => i.Client)
            .Include(i => i.Staff)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Incident>> GetIncidentsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Where(i => i.IncidentDate >= startDate && i.IncidentDate <= endDate && !i.IsDeleted)
            .Include(i => i.Client)
            .Include(i => i.Staff)
            .OrderByDescending(i => i.IncidentDate)
            .ThenByDescending(i => i.IncidentTime)
            .ToListAsync();
    }

    public async Task<int> GetActiveIncidentsCountAsync()
    {
        return await _dbSet
            .Where(i => i.IsActive && !i.IsDeleted)
            .CountAsync();
    }

    public async Task<int> GetIncidentsCountByStatusAsync(IncidentStatus status)
    {
        return await _dbSet
            .Where(i => i.Status == status && !i.IsDeleted)
            .CountAsync();
    }
    public async Task<IEnumerable<Incident>> GetPagedWithDetailsAsync(int page, int pageSize)
    {
        return await _dbSet
            .Where(j => j.IsActive && !j.IsDeleted)
            .Include(j => j.Client)
            .Include(j => j.Staff)
            .OrderByDescending(j => j.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }
} 