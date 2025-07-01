namespace CarePortal.Domain.Entities;

public class ClientDocument : BaseEntity
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public string UploadedBy { get; set; } = string.Empty;
    public DateTime Deadline { get; set; }
    public string Status { get; set; } = "pending";
    public bool IsActive { get; set; } = true;
    
    // Navigation property
    public virtual Client Client { get; set; } = null!;
} 