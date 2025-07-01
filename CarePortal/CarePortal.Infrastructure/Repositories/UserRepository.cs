using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using CarePortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace CarePortal.Infrastructure.Repositories;

public class UserRepository : GenericRepository<ApplicationUser>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<ApplicationUser>> GetActiveUsersAsync()
    {
        return await _dbSet
            .Where(u => u.IsActive && !u.IsDeleted)
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();
    }

    public async Task<ApplicationUser?> GetUserByEmailAsync(string email)
    {
        return await _dbSet
            .Where(u => u.Email == email && !u.IsDeleted)
            .FirstOrDefaultAsync();
    }

    public async Task<ApplicationUser?> GetUserByUsernameAsync(string username)
    {
        return await _dbSet
            .Where(u => u.UserName == username && !u.IsDeleted)
            .FirstOrDefaultAsync();
    }

    public async Task<ApplicationUser?> GetUserWithDetailsAsync(string id)
    {
        return await _dbSet
            .Where(u => u.Id == id && !u.IsDeleted)
            .Include(u => u.JobTimes)
            .Include(u => u.AssignedClients)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<ApplicationUser>> GetUsersByLocationAsync(string location)
    {
        return await _dbSet
            .Where(u => u.IsActive && !u.IsDeleted)
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();
    }

    public async Task<IEnumerable<ApplicationUser>> SearchUsersAsync(string searchTerm)
    {
        var term = searchTerm.ToLower();
        return await _dbSet
            .Where(u => !u.IsDeleted && 
                       (u.FirstName.ToLower().Contains(term) ||
                        u.LastName.ToLower().Contains(term) ||
                        u.Email!.ToLower().Contains(term) ||
                        u.UserName!.ToLower().Contains(term)))
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();
    }

    public async Task<IEnumerable<ApplicationUser>> GetUsersWithJobTimesAsync()
    {
        return await _dbSet
            .Where(u => u.IsActive && !u.IsDeleted)
            .Include(u => u.JobTimes)
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();
    }

    public async Task<IEnumerable<ApplicationUser>> GetUsersWithAssignedClientsAsync()
    {
        return await _dbSet
            .Where(u => u.IsActive && !u.IsDeleted)
            .Include(u => u.AssignedClients)
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync();
    }

    public async Task<int> GetActiveUsersCountAsync()
    {
        return await _dbSet
            .Where(u => u.IsActive && !u.IsDeleted)
            .CountAsync();
    }

    public async Task<DateTime?> GetLastLoginAsync(string userId)
    {
        var user = await _dbSet
            .Where(u => u.Id == userId)
            .Select(u => new { u.LastLoginAt })
            .FirstOrDefaultAsync();
        
        return user?.LastLoginAt;
    }

    public async Task UpdateLastLoginAsync(string userId)
    {
        var user = await _dbSet.FindAsync(userId);
        if (user != null)
        {
            user.LastLoginAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
} 