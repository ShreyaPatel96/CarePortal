using System.ComponentModel.DataAnnotations;

namespace CarePortal.Application.DTOs;

public class DocumentDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty; 
    public string FileType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string UploadedBy { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime Deadline { get; set; }
    public string Status { get; set; } = string.Empty; 
}

public class CreateDocumentDto
{
    [Required]
    public int ClientId { get; set; }
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;
    [Required]
    public DateTime Deadline { get; set; }
    public bool IsActive { get; set; } = true;
    public string? FileName { get; set; }
    public string? FileType { get; set; }
}

public class UpdateDocumentDto
{
    [StringLength(200)]
    public string? Title { get; set; }
    [StringLength(1000)]
    public string? Description { get; set; }
    public DateTime? Deadline { get; set; }
    public string? Status { get; set; }
    public bool? IsActive { get; set; }
    public string? FileName { get; set; }
    public string? FileType { get; set; }
}

public class DocumentListDto
{
    public List<DocumentDto> Documents { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

public class DocumentStatusSummaryDto
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int Upload { get; set; }
    public int Overdue { get; set; }
}