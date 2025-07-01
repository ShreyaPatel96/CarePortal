using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace CarePortal.Application.Services;

public class ClientService : IClientService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;

    public ClientService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    public async Task<ClientDto?> GetByIdAsync(int id)
    {
        var client = await _unitOfWork.Clients.GetClientWithDetailsAsync(id);

        if (client == null) return null;

        return new ClientDto
        {
            Id = client.Id,
            FirstName = client.FirstName,
            LastName = client.LastName,
            DateOfBirth = client.DateOfBirth,
            Address = client.Address,
            PhoneNumber = client.PhoneNumber,
            Email = client.Email,
            CreatedAt = client.CreatedAt,
            UpdatedAt = client.UpdatedAt,
            IsActive = client.IsActive,
            AssignedStaffId = client.AssignedStaffId,
            AssignedStaffName = client.AssignedStaff != null ? client.AssignedStaff.FullName : null
        };
    }

    public async Task<ClientListDto> GetAllAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null)
    {
        IEnumerable<Client> clients;
        int totalCount;

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            clients = await _unitOfWork.Clients.SearchClientsAsync(searchTerm);
            totalCount = clients.Count();
            clients = clients
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }
        else
        {
            totalCount = await _unitOfWork.Clients.GetActiveClientsCountAsync();
            clients = await _unitOfWork.Clients.GetPagedAsync(pageNumber, pageSize);
        }

        var clientDtos = clients.Select(client => new ClientDto
        {
            Id = client.Id,
            FirstName = client.FirstName,
            LastName = client.LastName,
            DateOfBirth = client.DateOfBirth,
            Address = client.Address,
            PhoneNumber = client.PhoneNumber,
            Email = client.Email,
            CreatedAt = client.CreatedAt,
            UpdatedAt = client.UpdatedAt,
            IsActive = client.IsActive,
            AssignedStaffId = client.AssignedStaffId,
            AssignedStaffName = client.AssignedStaff != null ? client.AssignedStaff.FullName : null
        }).ToList();

        return new ClientListDto
        {
            Clients = clientDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<ClientDto> CreateAsync(CreateClientDto createClientDto, string? currentUserId = null)
    {
        var client = new Client
        {
            FirstName = createClientDto.FirstName,
            LastName = createClientDto.LastName,
            DateOfBirth = createClientDto.DateOfBirth,
            Address = createClientDto.Address,
            PhoneNumber = createClientDto.PhoneNumber,
            Email = createClientDto.Email,
            AssignedStaffId = createClientDto.AssignedStaffId,
            IsActive = createClientDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserId
        };

        await _unitOfWork.Clients.AddAsync(client);

        return await GetByIdAsync(client.Id) ?? throw new InvalidOperationException("Failed to retrieve created client");
    }

    public async Task<ClientDto> UpdateAsync(int id, UpdateClientDto updateClientDto, string? currentUserId = null)
    {
        var client = await _unitOfWork.Clients.GetByIdAsync(id);
        if (client == null)
            throw new InvalidOperationException("Client not found");

        if (!string.IsNullOrEmpty(updateClientDto.FirstName))
            client.FirstName = updateClientDto.FirstName;

        if (!string.IsNullOrEmpty(updateClientDto.LastName))
            client.LastName = updateClientDto.LastName;

        if (updateClientDto.DateOfBirth.HasValue)
            client.DateOfBirth = updateClientDto.DateOfBirth.Value;

        if (!string.IsNullOrEmpty(updateClientDto.Address))
            client.Address = updateClientDto.Address;

        if (!string.IsNullOrEmpty(updateClientDto.PhoneNumber))
            client.PhoneNumber = updateClientDto.PhoneNumber;

        if (!string.IsNullOrEmpty(updateClientDto.Email))
            client.Email = updateClientDto.Email;

        if (updateClientDto.AssignedStaffId != null)
            client.AssignedStaffId = updateClientDto.AssignedStaffId;

        if (updateClientDto.IsActive.HasValue)
            client.IsActive = updateClientDto.IsActive.Value;

        client.UpdatedAt = DateTime.UtcNow;
        client.UpdatedBy = currentUserId;

        await _unitOfWork.Clients.UpdateAsync(client);

        return await GetByIdAsync(id) ?? throw new InvalidOperationException("Failed to retrieve updated client");
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var client = await _unitOfWork.Clients.GetByIdAsync(id);
        if (client == null) return false;

        client.IsDeleted = true;
        await _unitOfWork.Clients.UpdateAsync(client);
        return true;
    }

    public async Task<bool> ToggleActiveStatusAsync(int id, string? currentUserId = null)
    {
        var client = await _unitOfWork.Clients.GetByIdAsync(id);
        if (client == null) return false;

        client.IsActive = !client.IsActive;
        client.UpdatedAt = DateTime.UtcNow;
        client.UpdatedBy = currentUserId;

        await _unitOfWork.Clients.UpdateAsync(client);
        return true;
    }

    public async Task<List<ClientDto>> GetByStaffAsync(string staffId)
    {
        var clients = await _unitOfWork.Clients.GetClientsByStaffAsync(staffId);

        return clients.Select(client => new ClientDto
        {
            Id = client.Id,
            FirstName = client.FirstName,
            LastName = client.LastName,
            DateOfBirth = client.DateOfBirth,
            Address = client.Address,
            PhoneNumber = client.PhoneNumber,
            Email = client.Email,
            CreatedAt = client.CreatedAt,
            UpdatedAt = client.UpdatedAt,
            IsActive = client.IsActive,
            AssignedStaffId = client.AssignedStaffId,
            AssignedStaffName = client.AssignedStaff != null ? client.AssignedStaff.FullName : null
        }).ToList();
    }

    public async Task<List<ClientDto>> GetActiveClientsAsync()
    {
        var clients = await _unitOfWork.Clients.GetActiveClientsAsync();

        return clients.Select(client => new ClientDto
        {
            Id = client.Id,
            FirstName = client.FirstName,
            LastName = client.LastName,
            DateOfBirth = client.DateOfBirth,
            Address = client.Address,
            PhoneNumber = client.PhoneNumber,
            Email = client.Email,
            CreatedAt = client.CreatedAt,
            UpdatedAt = client.UpdatedAt,
            IsActive = client.IsActive,
            AssignedStaffId = client.AssignedStaffId,
            AssignedStaffName = client.AssignedStaff != null ? client.AssignedStaff.FullName : null
        }).ToList();
    }

    public async Task<int> GetTotalCountAsync()
    {
        return await _unitOfWork.Clients.CountAsync();
    }

    public async Task<int> GetActiveCountAsync()
    {
        return await _unitOfWork.Clients.GetActiveClientsCountAsync();
    }
} 