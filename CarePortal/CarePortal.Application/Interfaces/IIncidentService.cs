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
} 