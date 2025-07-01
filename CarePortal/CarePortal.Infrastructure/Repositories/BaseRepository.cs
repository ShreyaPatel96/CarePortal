using CarePortal.Application.Repository;
using CarePortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace CarePortal.Infrastructure.Repositories;

public abstract class BaseRepository<T> : IGenericRepository<T> where T : class
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;

    protected BaseRepository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(object id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.Where(predicate).ToListAsync();
    }

    public virtual async Task<T> AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<T> UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task DeleteAsync(T entity)
    {
        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
    }

    public virtual async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.AnyAsync(predicate);
    }

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        if (predicate == null)
            return await _dbSet.CountAsync();
        
        return await _dbSet.CountAsync(predicate);
    }

    public virtual IQueryable<T> GetAll()
    {
        return _dbSet.AsQueryable();
    }

    public virtual IQueryable<T> Find(Expression<Func<T, bool>> predicate)
    {
        return _dbSet.Where(predicate);
    }

    public virtual void Add(T entity)
    {
        _dbSet.Add(entity);
    }

    public virtual void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public virtual void Delete(T entity)
    {
        _dbSet.Remove(entity);
    }

    public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.FirstOrDefaultAsync(predicate);
    }

    public virtual async Task<T> FirstAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.FirstAsync(predicate);
    }

    public virtual async Task<IEnumerable<T>> GetPagedAsync(int page, int pageSize)
    {
        return await _dbSet
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public virtual async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    protected virtual IQueryable<T> IncludeRelatedEntities(IQueryable<T> query)
    {
        // Override in derived classes to include related entities
        return query;
    }

    protected virtual async Task<T?> GetByIdWithIncludesAsync(object id)
    {
        var entity = await _dbSet.FindAsync(id);
        if (entity == null) return null;

        // Reload with includes if needed
        var query = _dbSet.AsQueryable();
        query = IncludeRelatedEntities(query);
        return await query.FirstOrDefaultAsync(e => EF.Property<object>(e, "Id").Equals(id));
    }
} 