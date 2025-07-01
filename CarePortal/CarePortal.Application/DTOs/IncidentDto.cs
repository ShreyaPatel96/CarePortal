using System.ComponentModel.DataAnnotations;
using CarePortal.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace CarePortal.Application.DTOs;

public class IncidentDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string StaffId { get; set; } = string.Empty;
    public string StaffName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime IncidentDate { get; set; }
    public TimeSpan IncidentTime { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? FileName { get; set; }
    public bool IsActive { get; set; }
    public IncidentStatus Status { get; set; }
    public IncidentSeverity Severity { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateIncidentDto
{
    [Required]
    public int ClientId { get; set; }
    
    [Required]
    public string StaffId { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    public DateTime IncidentDate { get; set; }
    
    [Required]
    public TimeSpan IncidentTime { get; set; }
    
    [Required]
    [StringLength(500)]
    public string Location { get; set; } = string.Empty;
    
    public string? FileName { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public IncidentStatus Status { get; set; } = IncidentStatus.Open;
    
    public IncidentSeverity Severity { get; set; } = IncidentSeverity.Low;
}

public class UpdateIncidentDto
{
    [StringLength(200)]
    public string? Title { get; set; }
    
    [StringLength(2000)]
    public string? Description { get; set; }
    
    public DateTime? IncidentDate { get; set; }
    
    public TimeSpan? IncidentTime { get; set; }
    
    [StringLength(500)]
    public string? Location { get; set; }
    
    public string? FileName { get; set; }
    
    public bool? IsActive { get; set; }
    
    public IncidentStatus? Status { get; set; }
    
    public IncidentSeverity? Severity { get; set; }
}

public class IncidentListDto
{
    public List<IncidentDto> Incidents { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

public class IncidentStatsDto
{
    public int TotalIncidents { get; set; }
    public int ActiveIncidents { get; set; }
    public int OpenIncidents { get; set; }
    public int ResolvedIncidents { get; set; }
    public int ClosedIncidents { get; set; }
}

public class UploadPhotoDto
{
    [Required]
    public IFormFile Photo { get; set; } = null!;
}

public class UploadFileDto
{
    [Required]
    public IFormFile File { get; set; } = null!;
}

public class FileUploadResponseDto
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FileType { get; set; } = string.Empty;
} 