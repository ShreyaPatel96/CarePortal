namespace CarePortal.Application.Repository;

public interface IUnitOfWork : IDisposable
{
    // Generic repository
    IGenericRepository<TEntity> Repository<TEntity>() where TEntity : class;

    // Entity-specific repositories
    IClientRepository Clients { get; }
    IIncidentRepository Incidents { get; }
    IJobTimeRepository JobTimes { get; }
    IClientDocumentRepository ClientDocuments { get; }
    IUserRepository Users { get; }
    IRoleRepository Roles { get; }

    // Transaction methods
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
} 