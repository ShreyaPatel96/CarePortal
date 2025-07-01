using CarePortal.Application.DTOs;

namespace CarePortal.Application.Interfaces;

public interface IClientService
{
    Task<ClientDto?> GetByIdAsync(int id);
    Task<ClientListDto> GetAllAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null);
    Task<ClientDto> CreateAsync(CreateClientDto createClientDto, string? currentUserId = null);
    Task<ClientDto> UpdateAsync(int id, UpdateClientDto updateClientDto, string? currentUserId = null);
    Task<bool> DeleteAsync(int id);
    Task<bool> ToggleActiveStatusAsync(int id, string? currentUserId = null);
    Task<List<ClientDto>> GetByStaffAsync(string staffId);
    Task<List<ClientDto>> GetActiveClientsAsync();
    Task<int> GetTotalCountAsync();
    Task<int> GetActiveCountAsync();
} 