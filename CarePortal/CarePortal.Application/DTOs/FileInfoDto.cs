namespace CarePortal.Application.DTOs;

public class FileInfoDto
{
    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FileType { get; set; } = string.Empty;
    public string UploadType { get; set; } = string.Empty; // "document" or "incident"
    public DateTime CreatedAt { get; set; }
    public DateTime LastModified { get; set; }
} 