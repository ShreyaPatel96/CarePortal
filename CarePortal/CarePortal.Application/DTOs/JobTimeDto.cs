using System.ComponentModel.DataAnnotations;
using CarePortal.Domain.Enums;

namespace CarePortal.Application.DTOs;

public class JobTimeDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string StaffId { get; set; } = string.Empty;
    public string StaffName { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public ActivityType ActivityType { get; set; }
    public string ActivityTypeDisplayName => ActivityType.GetDisplayName();
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; }
}

public class CreateJobTimeDto
{
    [Required]
    public int ClientId { get; set; }
    [Required]
    public string StaffId { get; set; } = string.Empty;
    [Required]
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    [Required]
    public ActivityType ActivityType { get; set; }
    [StringLength(2000)]
    public string Notes { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

public class UpdateJobTimeDto
{
    public DateTime? StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public ActivityType? ActivityType { get; set; }
    [StringLength(2000)]
    public string? Notes { get; set; }
    public bool? IsActive { get; set; }
}

public class JobTimeListDto
{
    public List<JobTimeDto> JobTimes { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}