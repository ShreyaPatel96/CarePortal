using CarePortal.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CarePortal.Infrastructure.Services;

public class FileUploadService : IFileUploadService
{
    private readonly string _incidentUploadPath;
    private readonly string _documentUploadPath;
    private readonly string _baseUrl;
    private readonly long _maxFileSize;
    private readonly string[] _allowedExtensions;
    private readonly ILogger<FileUploadService> _logger;

    public FileUploadService(IConfiguration configuration, ILogger<FileUploadService> logger)
    {
        _logger = logger;
        _incidentUploadPath = configuration["FileUpload:IncidentPath"] ?? "C:\\CarePortalincidentUploadFile";
        _documentUploadPath = configuration["FileUpload:DocumentPath"] ?? "C:\\CarePortalDocumentUploadFile";
        _baseUrl = configuration["FileUpload:BaseUrl"] ?? "/uploads";
        _maxFileSize = (configuration.GetValue<int>("FileUpload:MaxFileSizeMB", 50) * 1024 * 1024);
        _allowedExtensions = configuration.GetSection("FileUpload:AllowedExtensions").Get<string[]>() 
            ?? new[] { ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx" };
        
        _logger.LogInformation("FileUploadService initialized with IncidentPath: {IncidentPath}, DocumentPath: {DocumentPath}", 
            _incidentUploadPath, _documentUploadPath);
        
        // Ensure upload directories exist
        EnsureDirectoryExists(_incidentUploadPath, "incident");
        EnsureDirectoryExists(_documentUploadPath, "document");
    }

    private void EnsureDirectoryExists(string path, string type)
    {
        if (!Directory.Exists(path))
        {
            try
            {
                Directory.CreateDirectory(path);
                _logger.LogInformation("Created {Type} upload directory: {Path}", type, path);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create {Type} upload directory: {Path}", type, path);
                throw;
            }
        }
        else
        {
            _logger.LogInformation("{Type} upload directory already exists: {Path}", type, path);
        }
    }

    public async Task<string> UploadFileAsync(IFormFile file, string uploadType = "document")
    {
        var uploadPath = GetUploadPath(uploadType);
        return await UploadFile(file, uploadPath);
    }

    private async Task<string> UploadFile(IFormFile file, string uploadPath)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is required");

        // Validate file type
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!_allowedExtensions.Contains(fileExtension))
            throw new ArgumentException($"Invalid file type. Allowed types: {string.Join(", ", _allowedExtensions)}");

        // Validate file size
        if (file.Length > _maxFileSize)
            throw new ArgumentException($"File size too large. Maximum size is {_maxFileSize / (1024 * 1024)}MB.");

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadPath, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        _logger.LogInformation("File uploaded successfully: {FileName} to {Path}", fileName, uploadPath);
        return fileName;
    }

    public async Task<bool> DeleteFileAsync(string fileName, string uploadType = "document")
    {
        var uploadPath = GetUploadPath(uploadType);
        return await DeleteFile(fileName, uploadPath);
    }

    private async Task<bool> DeleteFile(string fileName, string uploadPath)
    {
        var filePath = Path.Combine(uploadPath, fileName);
        if (File.Exists(filePath))
        {
            await Task.Run(() => File.Delete(filePath));
            _logger.LogInformation("File deleted successfully: {FileName} from {Path}", fileName, uploadPath);
            return true;
        }
        
        _logger.LogWarning("File not found for deletion: {FileName} in {Path}", fileName, uploadPath);
        return false;
    }

    public string DownloadFileAsync(string fileName, string uploadType = "document")
    {
        var uploadPath = GetUploadPath(uploadType);
        return Path.Combine(uploadPath, fileName);
    }

    private string GetUploadPath(string uploadType)
    {
        return uploadType.ToLowerInvariant() switch
        {
            "incident" => _incidentUploadPath,
            "document" => _documentUploadPath,
            _ => throw new ArgumentException($"Invalid upload type: {uploadType}. Valid types are 'incident' and 'document'.")
        };
    }
} 