
public class FileInfoDto
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string FileType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime LastModified { get; set; }
} 