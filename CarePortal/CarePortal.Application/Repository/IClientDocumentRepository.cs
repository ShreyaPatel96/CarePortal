using CarePortal.Domain.Entities;

namespace CarePortal.Application.Repository
{
    public interface IClientDocumentRepository : IGenericRepository<ClientDocument>
    {
        Task<IEnumerable<ClientDocument>> GetActiveDocumentsAsync();
        Task<IEnumerable<ClientDocument>> GetDocumentsByClientAsync(int clientId);
        Task<IEnumerable<ClientDocument>> GetDocumentsByStatusAsync(string status);
        Task<IEnumerable<ClientDocument>> GetDocumentsByFileTypeAsync(string fileType);
        Task<IEnumerable<ClientDocument>> GetDocumentsByUploaderAsync(string uploadedBy);
        Task<ClientDocument?> GetDocumentWithDetailsAsync(int id);
        Task<IEnumerable<ClientDocument>> GetDocumentsByDeadlineRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<ClientDocument>> GetOverdueDocumentsAsync();
        Task<IEnumerable<ClientDocument>> GetDocumentsDueTodayAsync();
        Task<int> GetActiveDocumentsCountAsync();
        Task<int> GetDocumentsCountByStatusAsync(string status);
    }
}
