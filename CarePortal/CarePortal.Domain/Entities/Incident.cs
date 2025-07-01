using CarePortal.Domain.Enums;

namespace CarePortal.Domain.Entities;

public class Incident : BaseEntity
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string StaffId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime IncidentDate { get; set; }
    public TimeSpan IncidentTime { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? FileName { get; set; }
    public bool IsActive { get; set; } = true;
    public IncidentStatus Status { get; set; } = IncidentStatus.Open;
    public IncidentSeverity Severity { get; set; } = IncidentSeverity.Low;
    
    // Navigation properties
    public virtual Client Client { get; set; } = null!;
    public virtual ApplicationUser Staff { get; set; } = null!;
} 