using Microsoft.AspNetCore.Http;

namespace CarePortal.Application.Interfaces;

public interface IFileUploadService
{
    Task<string> UploadPhotoAsync(IFormFile photo);
    Task<string> UploadFileAsync(IFormFile file);
    Task<bool> DeletePhotoAsync(string photoPath);
    Task<bool> DeleteFileAsync(string filePath);
    string GetPhotoUrl(string photoPath);
    string GetFileUrl(string filePath);
    string GetFullFilePath(string fileName);
    bool FileExists(string fileName);
} 