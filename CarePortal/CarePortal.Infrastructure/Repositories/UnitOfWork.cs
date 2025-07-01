using CarePortal.Application.Repository;
using CarePortal.Persistence.Context;
using Microsoft.EntityFrameworkCore.Storage;

namespace CarePortal.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private readonly Dictionary<Type, object> _repositories;
    private IDbContextTransaction? _transaction;

    // Entity-specific repositories
    private IClientRepository? _clientRepository;
    private IIncidentRepository? _incidentRepository;
    private IJobTimeRepository? _jobTimeRepository;
    private IClientDocumentRepository? _clientDocumentRepository;
    private IUserRepository? _userRepository;
    private IRoleRepository? _roleRepository;

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        _repositories = new Dictionary<Type, object>();
    }

    public IGenericRepository<TEntity> Repository<TEntity>() where TEntity : class
    {
        var type = typeof(TEntity);
        
        if (!_repositories.ContainsKey(type))
        {
            _repositories[type] = new GenericRepository<TEntity>(_context);
        }
        
        return (IGenericRepository<TEntity>)_repositories[type];
    }

    public IClientRepository Clients => 
        _clientRepository ??= new ClientRepository(_context);

    public IIncidentRepository Incidents => 
        _incidentRepository ??= new IncidentRepository(_context);

    public IJobTimeRepository JobTimes => 
        _jobTimeRepository ??= new JobTimeRepository(_context);

    public IClientDocumentRepository ClientDocuments => 
        _clientDocumentRepository ??= new ClientDocumentRepository(_context);

    public IUserRepository Users => 
        _userRepository ??= new UserRepository(_context);

    public IRoleRepository Roles => 
        _roleRepository ??= new RoleRepository(_context);

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
} 