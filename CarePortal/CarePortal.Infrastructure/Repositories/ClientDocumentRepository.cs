using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using CarePortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace CarePortal.Infrastructure.Repositories;

public class ClientDocumentRepository : GenericRepository<ClientDocument>, IClientDocumentRepository
{
    public ClientDocumentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<ClientDocument>> GetActiveDocumentsAsync()
    {
        return await _dbSet
            .Where(d => d.IsActive && !d.IsDeleted)
            .Include(d => d.Client)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ClientDocument>> GetDocumentsByClientAsync(int clientId)
    {
        return await _dbSet
            .Where(d => d.ClientId == clientId && !d.IsDeleted)
            .Include(d => d.Client)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ClientDocument>> GetDocumentsByStatusAsync(string status)
    {
        return await _dbSet
            .Where(d => d.Status == status && !d.IsDeleted)
            .Include(d => d.Client)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ClientDocument>> GetDocumentsByFileTypeAsync(string fileType)
    {
        return await _dbSet
            .Where(d => d.FileType == fileType && !d.IsDeleted)
            .Include(d => d.Client)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ClientDocument>> GetDocumentsByUploaderAsync(string uploadedBy)
    {
        return await _dbSet
            .Where(d => d.UploadedBy == uploadedBy && !d.IsDeleted)
            .Include(d => d.Client)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<ClientDocument?> GetDocumentWithDetailsAsync(int id)
    {
        return await _dbSet
            .Where(d => d.Id == id && !d.IsDeleted)
            .Include(d => d.Client)
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<ClientDocument>> GetDocumentsByDeadlineRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await _dbSet
            .Where(d => d.Deadline >= startDate && d.Deadline <= endDate && !d.IsDeleted)
            .Include(d => d.Client)
            .OrderBy(d => d.Deadline)
            .ToListAsync();
    }

    public async Task<IEnumerable<ClientDocument>> GetOverdueDocumentsAsync()
    {
        var today = DateTime.Today;
        return await _dbSet
            .Where(d => d.Deadline < today && d.Status != "completed" && !d.IsDeleted)
            .Include(d => d.Client)
            .OrderBy(d => d.Deadline)
            .ToListAsync();
    }

    public async Task<IEnumerable<ClientDocument>> GetDocumentsDueTodayAsync()
    {
        var today = DateTime.Today;
        return await _dbSet
            .Where(d => d.Deadline.Date == today && !d.IsDeleted)
            .Include(d => d.Client)
            .OrderBy(d => d.Deadline)
            .ToListAsync();
    }

    public async Task<int> GetActiveDocumentsCountAsync()
    {
        return await _dbSet
            .Where(d => d.IsActive && !d.IsDeleted)
            .CountAsync();
    }

    public async Task<int> GetDocumentsCountByStatusAsync(string status)
    {
        return await _dbSet
            .Where(d => d.Status == status && !d.IsDeleted)
            .CountAsync();
    }
} 