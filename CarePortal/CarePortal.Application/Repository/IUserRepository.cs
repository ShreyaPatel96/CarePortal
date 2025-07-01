using CarePortal.Domain.Entities;

namespace CarePortal.Application.Repository
{
    public interface IUserRepository : IGenericRepository<ApplicationUser>
    {
        Task<IEnumerable<ApplicationUser>> GetActiveUsersAsync();
        Task<ApplicationUser?> GetUserByEmailAsync(string email);
        Task<ApplicationUser?> GetUserByUsernameAsync(string username);
        Task<ApplicationUser?> GetUserWithDetailsAsync(string id);
        Task<IEnumerable<ApplicationUser>> GetUsersByLocationAsync(string location);
        Task<IEnumerable<ApplicationUser>> SearchUsersAsync(string searchTerm);
        Task<IEnumerable<ApplicationUser>> GetUsersWithJobTimesAsync();
        Task<IEnumerable<ApplicationUser>> GetUsersWithAssignedClientsAsync();
        Task<int> GetActiveUsersCountAsync();
        Task<DateTime?> GetLastLoginAsync(string userId);
        Task UpdateLastLoginAsync(string userId);
    }
}
