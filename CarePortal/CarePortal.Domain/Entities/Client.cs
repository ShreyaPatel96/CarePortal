namespace CarePortal.Domain.Entities;

public class Client : BaseEntity
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    
    // Foreign key for assigned staff
    public string? AssignedStaffId { get; set; }
    
    // Navigation properties
    public virtual ApplicationUser? AssignedStaff { get; set; }
    public virtual ICollection<ClientDocument> Documents { get; set; } = new List<ClientDocument>();
    public virtual ICollection<JobTime> JobTimes { get; set; } = new List<JobTime>();
    
    public string FullName => $"{FirstName} {LastName}".Trim();
    public int Age => DateTime.Today.Year - DateOfBirth.Year - (DateTime.Today < DateOfBirth.AddYears(DateTime.Today.Year - DateOfBirth.Year) ? 1 : 0);
} 