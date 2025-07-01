using CarePortal.Domain.Enums;

namespace CarePortal.Domain.Entities;

public class JobTime : BaseEntity
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string StaffId { get; set; } = string.Empty;
    public DateTime StartTime { get; set; }
    public DateTime? EndTime { get; set; }
    public ActivityType ActivityType { get; set; }
    public string Notes { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    // Navigation properties
    public virtual Client Client { get; set; } = null!;
    public virtual ApplicationUser Staff { get; set; } = null!;
    
    public TimeSpan? Duration => EndTime?.Subtract(StartTime);
    public bool IsCompleted => EndTime.HasValue;
} 