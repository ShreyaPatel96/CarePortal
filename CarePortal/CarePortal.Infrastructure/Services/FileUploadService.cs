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
        
        _logger.LogInformation("FileUploadService initialized with IncidentPath: {IncidentPath}", _incidentUploadPath);
        
        // Ensure upload directories exist
        if (!Directory.Exists(_incidentUploadPath))
        {
            try
            {
                Directory.CreateDirectory(_incidentUploadPath);
                _logger.LogInformation("Created incident upload directory: {IncidentPath}", _incidentUploadPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create incident upload directory: {IncidentPath}", _incidentUploadPath);
                throw;
            }
        }
        else
        {
            _logger.LogInformation("Incident upload directory already exists: {IncidentPath}", _incidentUploadPath);
        }
        
        if (!Directory.Exists(_documentUploadPath))
        {
            try
            {
                Directory.CreateDirectory(_documentUploadPath);
                _logger.LogInformation("Created document upload directory: {DocumentPath}", _documentUploadPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create document upload directory: {DocumentPath}", _documentUploadPath);
                throw;
            }
        }
        else
        {
            _logger.LogInformation("Document upload directory already exists: {DocumentPath}", _documentUploadPath);
        }
    }

    public async Task<string> UploadPhotoAsync(IFormFile photo)
    {
        _logger.LogInformation("Uploading incident photo to path: {IncidentPath}", _incidentUploadPath);
        var fileName = await UploadFileAsync(photo, _incidentUploadPath);
        _logger.LogInformation("Successfully uploaded incident photo: {FileName}", fileName);
        return fileName;
    }

    public async Task<string> UploadFileAsync(IFormFile file)
    {
        // Default to document upload path for general file uploads
        return await UploadFileAsync(file, _documentUploadPath);
    }

    private async Task<string> UploadFileAsync(IFormFile file, string uploadPath)
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

        return fileName;
    }

    public async Task<bool> DeletePhotoAsync(string photoPath)
    {
        return await DeleteFileAsync(photoPath, _incidentUploadPath);
    }

    public async Task<bool> DeleteFileAsync(string filePath)
    {
        // Try both paths for backward compatibility
        var incidentPath = Path.Combine(_incidentUploadPath, filePath);
        var documentPath = Path.Combine(_documentUploadPath, filePath);

        if (File.Exists(incidentPath))
        {
            return await DeleteFileAsync(filePath, _incidentUploadPath);
        }
        else if (File.Exists(documentPath))
        {
            return await DeleteFileAsync(filePath, _documentUploadPath);
        }

        return false;
    }

    private async Task<bool> DeleteFileAsync(string fileName, string uploadPath)
    {
        var filePath = Path.Combine(uploadPath, fileName);
        if (File.Exists(filePath))
        {
            await Task.Run(() => File.Delete(filePath));
            return true;
        }
        return false;
    }

    public string GetPhotoUrl(string photoPath)
    {
        return $"{_baseUrl}/incidents/{photoPath}";
    }

    public string GetFileUrl(string filePath)
    {
        return $"{_baseUrl}/documents/{filePath}";
    }

    public string GetFullFilePath(string fileName)
    {
        // Try both paths for backward compatibility
        var incidentPath = Path.Combine(_incidentUploadPath, fileName);
        var documentPath = Path.Combine(_documentUploadPath, fileName);

        if (File.Exists(incidentPath))
        {
            return incidentPath;
        }
        else if (File.Exists(documentPath))
        {
            return documentPath;
        }

        return string.Empty;
    }

    public bool FileExists(string fileName)
    {
        var incidentPath = Path.Combine(_incidentUploadPath, fileName);
        var documentPath = Path.Combine(_documentUploadPath, fileName);
        
        return File.Exists(incidentPath) || File.Exists(documentPath);
    }
} 