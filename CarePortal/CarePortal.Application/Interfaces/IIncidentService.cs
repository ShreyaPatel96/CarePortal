using CarePortal.Application.DTOs;
using CarePortal.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace CarePortal.Application.Interfaces;

public interface IIncidentService
{
    Task<IncidentDto?> GetByIdAsync(int id);
    Task<IncidentListDto> GetAllAsync(int pageNumber = 1, int pageSize = 10, IncidentStatus? status = null, IncidentSeverity? severity = null);
    Task<IncidentDto> CreateAsync(CreateIncidentDto createIncidentDto, string? currentUserId = null);
    Task<IncidentDto> UpdateAsync(int id, UpdateIncidentDto updateIncidentDto, string? currentUserId = null);
    Task<bool> DeleteAsync(int id);
    Task<bool> ResolveIncidentAsync(int id, string resolvedBy, string resolutionNotes, string? currentUserId = null);
    Task<List<IncidentDto>> GetByClientAsync(int clientId);
    Task<List<IncidentDto>> GetByStaffAsync(string staffId);
    Task<List<IncidentDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IncidentStatsDto> GetStatsAsync();
    Task<IncidentStatsDto> GetStatsByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<string> UploadPhotoAsync(IFormFile photo);
    string GetPhotoUrl(string photoPath);
} 