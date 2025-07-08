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

    public async Task<IEnumerable<ClientDocument>> GetDocumentsWithClientAsync()
    {
        return await _dbSet
            .Include(d => d.Client)
            .Where(d => !d.IsDeleted)
            .ToListAsync();
    }
} 