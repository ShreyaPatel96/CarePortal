using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace CarePortal.Application.DTOs;

public class DocumentDto
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty; // Store filename with extension
    public string FileType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string UploadedBy { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime Deadline { get; set; }
    public string Status { get; set; } = string.Empty; // pending, uploaded, overdue, applied
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
}

public class CreateDocumentWithFileDto
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
    
    public IFormFile? File { get; set; }
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
}

public class UpdateDocumentWithFileDto
{
    [StringLength(200)]
    public string? Title { get; set; }
    
    [StringLength(1000)]
    public string? Description { get; set; }
    
    public DateTime? Deadline { get; set; }
    
    public IFormFile? File { get; set; }
}

public class LinkFileToDocumentDto
{
    [Required]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    public long FileSize { get; set; }
    
    [Required]
    public string FileType { get; set; } = string.Empty;
}

public class DocumentListDto
{
    public List<DocumentDto> Documents { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

public class DocumentStatsDto
{
    public int TotalDocuments { get; set; }
    public int PendingDocuments { get; set; }
    public int UploadDocuments { get; set; }
    public int OverdueDocuments { get; set; }
}

public class DocumentStatusSummaryDto
{
    public int Total { get; set; }
    public int Pending { get; set; }
    public int Upload { get; set; }
    public int Overdue { get; set; }
}

public class UploadDocumentFileDto
{
    [Required]
    public IFormFile File { get; set; } = null!;
}

public class DocumentUploadResponseDto
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
} 