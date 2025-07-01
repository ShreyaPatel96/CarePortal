using Microsoft.AspNetCore.Identity;

namespace CarePortal.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsDeleted { get; set; } = false;
    
    // Navigation properties
    public virtual ICollection<JobTime> JobTimes { get; set; } = new List<JobTime>();
    public virtual ICollection<Client> AssignedClients { get; set; } = new List<Client>();
    
    public string FullName => $"{FirstName} {LastName}".Trim();
} 