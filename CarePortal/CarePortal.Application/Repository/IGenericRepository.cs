using System.Linq.Expressions;

namespace CarePortal.Application.Repository;

public interface IGenericRepository<T> where T : class
{
    // Async methods
    Task<T?> GetByIdAsync(object id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(T entity);
    Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
    
    // Synchronous methods for queryable operations
    IQueryable<T> GetAll();
    IQueryable<T> Find(Expression<Func<T, bool>> predicate);
    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);
    
    // Additional useful methods
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
    Task<T> FirstAsync(Expression<Func<T, bool>> predicate);
    Task<IEnumerable<T>> GetPagedAsync(int page, int pageSize);
    Task<int> SaveChangesAsync();
} 