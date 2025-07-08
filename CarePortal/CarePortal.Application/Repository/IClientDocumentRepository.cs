using CarePortal.Domain.Entities;

namespace CarePortal.Application.Repository
{
    public interface IClientDocumentRepository : IGenericRepository<ClientDocument>
    {
        Task<IEnumerable<ClientDocument>> GetDocumentsWithClientAsync();
    }
}
