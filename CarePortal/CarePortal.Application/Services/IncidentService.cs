using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using CarePortal.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace CarePortal.Application.Services;

public class IncidentService : IIncidentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileUploadService _fileUploadService;

    public IncidentService(IUnitOfWork unitOfWork, IFileUploadService fileUploadService)
    {
        _unitOfWork = unitOfWork;
        _fileUploadService = fileUploadService;
    }

    public async Task<IncidentDto?> GetByIdAsync(int id)
    {
        var incident = await _unitOfWork.Incidents.GetIncidentWithDetailsAsync(id);

        if (incident == null) return null;

        return new IncidentDto
        {
            Id = incident.Id,
            ClientId = incident.ClientId,
            ClientName = incident.Client?.FullName ?? "Unknown Client",
            StaffId = incident.StaffId,
            StaffName = incident.Staff?.FullName ?? "Unknown Staff",
            Title = incident.Title,
            Description = incident.Description,
            IncidentDate = incident.IncidentDate,
            IncidentTime = incident.IncidentTime,
            Location = incident.Location,
            FileName = incident.FileName,
            IsActive = incident.IsActive,
            Status = incident.Status,
            Severity = incident.Severity,
            CreatedAt = incident.CreatedAt,
            UpdatedAt = incident.UpdatedAt
        };
    }

    public async Task<IncidentListDto> GetAllAsync(int pageNumber = 1, int pageSize = 10, IncidentStatus? status = null, IncidentSeverity? severity = null)
    {
        IEnumerable<Incident> incidents;
        int totalCount;

        if (status.HasValue && severity.HasValue)
        {
            var statusIncidents = await _unitOfWork.Incidents.GetIncidentsByStatusAsync(status.Value);
            incidents = statusIncidents.Where(i => i.Severity == severity.Value);
            totalCount = incidents.Count();
            incidents = incidents
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }
        else if (status.HasValue)
        {
            incidents = await _unitOfWork.Incidents.GetIncidentsByStatusAsync(status.Value);
            totalCount = incidents.Count();
            incidents = incidents
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }
        else if (severity.HasValue)
        {
            incidents = await _unitOfWork.Incidents.GetIncidentsBySeverityAsync(severity.Value);
            totalCount = incidents.Count();
            incidents = incidents
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);
        }
        else
        {
            totalCount = await _unitOfWork.Incidents.GetActiveIncidentsCountAsync();
            incidents = await _unitOfWork.Incidents.GetPagedWithDetailsAsync(pageNumber, pageSize);
        }

        var incidentDtos = incidents.Select(incident => new IncidentDto
        {
            Id = incident.Id,
            ClientId = incident.ClientId,
            ClientName = incident.Client?.FullName ?? "Unknown Client",
            StaffId = incident.StaffId,
            StaffName = incident.Staff?.FullName ?? "Unknown Staff",
            Title = incident.Title,
            Description = incident.Description,
            IncidentDate = incident.IncidentDate,
            IncidentTime = incident.IncidentTime,
            Location = incident.Location,
            FileName = incident.FileName,
            IsActive = incident.IsActive,
            Status = incident.Status,
            Severity = incident.Severity,
            CreatedAt = incident.CreatedAt,
            UpdatedAt = incident.UpdatedAt
        }).ToList();

        return new IncidentListDto
        {
            Incidents = incidentDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<IncidentDto> CreateAsync(CreateIncidentDto createIncidentDto, string? currentUserId = null)
    {
        var incident = new Incident
        {
            ClientId = createIncidentDto.ClientId,
            StaffId = createIncidentDto.StaffId,
            Title = createIncidentDto.Title,
            Description = createIncidentDto.Description,
            IncidentDate = createIncidentDto.IncidentDate,
            IncidentTime = createIncidentDto.IncidentTime,
            Location = createIncidentDto.Location,
            FileName = createIncidentDto.FileName,
            IsActive = createIncidentDto.IsActive,
            Status = createIncidentDto.Status,
            Severity = createIncidentDto.Severity,
            CreatedBy = currentUserId   
        };

        await _unitOfWork.Incidents.AddAsync(incident);

        return await GetByIdAsync(incident.Id) ?? throw new InvalidOperationException("Failed to retrieve created incident");
    }

    public async Task<IncidentDto> UpdateAsync(int id, UpdateIncidentDto updateIncidentDto, string? currentUserId = null)
    {
        var incident = await _unitOfWork.Incidents.GetByIdAsync(id);
        if (incident == null)
            throw new InvalidOperationException("Incident not found");

        if (!string.IsNullOrEmpty(updateIncidentDto.Title))
            incident.Title = updateIncidentDto.Title;

        if (!string.IsNullOrEmpty(updateIncidentDto.Description))
            incident.Description = updateIncidentDto.Description;

        if (updateIncidentDto.IncidentDate.HasValue)
            incident.IncidentDate = updateIncidentDto.IncidentDate.Value;

        if (updateIncidentDto.IncidentTime.HasValue)
            incident.IncidentTime = updateIncidentDto.IncidentTime.Value;

        if (!string.IsNullOrEmpty(updateIncidentDto.Location))
            incident.Location = updateIncidentDto.Location;

        if (!string.IsNullOrEmpty(updateIncidentDto.FileName))
            incident.FileName = updateIncidentDto.FileName;

        if (updateIncidentDto.IsActive.HasValue)
            incident.IsActive = updateIncidentDto.IsActive.Value;

        if (updateIncidentDto.Status.HasValue)
            incident.Status = updateIncidentDto.Status.Value;

        if (updateIncidentDto.Severity.HasValue)
            incident.Severity = updateIncidentDto.Severity.Value;

        incident.UpdatedAt = DateTime.UtcNow;
        incident.UpdatedBy = currentUserId;

        await _unitOfWork.Incidents.UpdateAsync(incident);

        return await GetByIdAsync(id) ?? throw new InvalidOperationException("Failed to retrieve updated incident");
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var incident = await _unitOfWork.Incidents.GetByIdAsync(id);
        if (incident == null) return false;

        // Delete associated photo if exists
        if (!string.IsNullOrEmpty(incident.FileName))
        {
            await _fileUploadService.DeletePhotoAsync(incident.FileName);
        }

        await _unitOfWork.Incidents.DeleteAsync(incident);
        return true;
    }

    public async Task<bool> ResolveIncidentAsync(int id, string resolvedBy, string resolutionNotes, string? currentUserId = null)
    {
        var incident = await _unitOfWork.Incidents.GetByIdAsync(id);
        if (incident == null) return false;

        incident.Status = IncidentStatus.Resolved;
        incident.UpdatedAt = DateTime.UtcNow;
        incident.UpdatedBy = currentUserId;

        await _unitOfWork.Incidents.UpdateAsync(incident);
        return true;
    }

    public async Task<List<IncidentDto>> GetByClientAsync(int clientId)
    {
        var incidents = await _unitOfWork.Incidents.GetIncidentsByClientAsync(clientId);

        return incidents.Select(incident => new IncidentDto
        {
            Id = incident.Id,
            ClientId = incident.ClientId,
            ClientName = incident.Client?.FullName ?? "Unknown Client",
            StaffId = incident.StaffId,
            StaffName = incident.Staff?.FullName ?? "Unknown Staff",
            Title = incident.Title,
            Description = incident.Description,
            IncidentDate = incident.IncidentDate,
            IncidentTime = incident.IncidentTime,
            Location = incident.Location,
            FileName = incident.FileName,
            IsActive = incident.IsActive,
            Status = incident.Status,
            Severity = incident.Severity,
            CreatedAt = incident.CreatedAt,
            UpdatedAt = incident.UpdatedAt
        }).ToList();
    }

    public async Task<List<IncidentDto>> GetByStaffAsync(string staffId)
    {
        var incidents = await _unitOfWork.Incidents.GetIncidentsByStaffAsync(staffId);

        return incidents.Select(incident => new IncidentDto
        {
            Id = incident.Id,
            ClientId = incident.ClientId,
            ClientName = incident.Client?.FullName ?? "Unknown Client",
            StaffId = incident.StaffId,
            StaffName = incident.Staff?.FullName ?? "Unknown Staff",
            Title = incident.Title,
            Description = incident.Description,
            IncidentDate = incident.IncidentDate,
            IncidentTime = incident.IncidentTime,
            Location = incident.Location,
            FileName = incident.FileName,
            IsActive = incident.IsActive,
            Status = incident.Status,
            Severity = incident.Severity,
            CreatedAt = incident.CreatedAt,
            UpdatedAt = incident.UpdatedAt
        }).ToList();
    }

    public async Task<List<IncidentDto>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var incidents = await _unitOfWork.Incidents.GetIncidentsByDateRangeAsync(startDate, endDate);

        return incidents.Select(incident => new IncidentDto
        {
            Id = incident.Id,
            ClientId = incident.ClientId,
            ClientName = incident.Client?.FullName ?? "Unknown Client",
            StaffId = incident.StaffId,
            StaffName = incident.Staff?.FullName ?? "Unknown Staff",
            Title = incident.Title,
            Description = incident.Description,
            IncidentDate = incident.IncidentDate,
            IncidentTime = incident.IncidentTime,
            Location = incident.Location,
            FileName = incident.FileName,
            IsActive = incident.IsActive,
            Status = incident.Status,
            Severity = incident.Severity,
            CreatedAt = incident.CreatedAt,
            UpdatedAt = incident.UpdatedAt
        }).ToList();
    }

    public async Task<IncidentStatsDto> GetStatsAsync()
    {
        var totalIncidents = await _unitOfWork.Incidents.CountAsync();
        var activeIncidents = await _unitOfWork.Incidents.GetActiveIncidentsCountAsync();
        var openIncidents = await _unitOfWork.Incidents.GetIncidentsCountByStatusAsync(IncidentStatus.Open);
        var resolvedIncidents = await _unitOfWork.Incidents.GetIncidentsCountByStatusAsync(IncidentStatus.Resolved);

        return new IncidentStatsDto
        {
            TotalIncidents = totalIncidents,
            ActiveIncidents = activeIncidents,
            OpenIncidents = openIncidents,
            ResolvedIncidents = resolvedIncidents
        };
    }

    public async Task<IncidentStatsDto> GetStatsByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var incidents = await _unitOfWork.Incidents.GetIncidentsByDateRangeAsync(startDate, endDate);
        var totalIncidents = incidents.Count();
        var activeIncidents = incidents.Count(i => i.IsActive);
        var openIncidents = incidents.Count(i => i.Status == IncidentStatus.Open);
        var resolvedIncidents = incidents.Count(i => i.Status == IncidentStatus.Resolved);

        return new IncidentStatsDto
        {
            TotalIncidents = totalIncidents,
            ActiveIncidents = activeIncidents,
            OpenIncidents = openIncidents,
            ResolvedIncidents = resolvedIncidents
        };
    }

    public async Task<string> UploadPhotoAsync(IFormFile photo)
    {
        return await _fileUploadService.UploadPhotoAsync(photo);
    }

    public string GetPhotoUrl(string photoPath)
    {
        return _fileUploadService.GetPhotoUrl(photoPath);
    }
} 