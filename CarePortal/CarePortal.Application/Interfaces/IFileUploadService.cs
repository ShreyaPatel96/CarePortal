using Microsoft.AspNetCore.Http;

namespace CarePortal.Application.Interfaces;

public interface IFileUploadService
{
    Task<string> UploadFileAsync(IFormFile file, string uploadType = "document");
    string DownloadFileAsync(string fileName, string uploadType = "document");
    Task<bool> DeleteFileAsync(string fileName, string uploadType = "document");
} 