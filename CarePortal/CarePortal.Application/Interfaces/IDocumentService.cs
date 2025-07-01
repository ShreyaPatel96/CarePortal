using CarePortal.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace CarePortal.Application.Interfaces;

public interface IDocumentService
{
    Task<DocumentDto?> GetByIdAsync(int id);
    Task<DocumentListDto> GetAllAsync(int pageNumber = 1, int pageSize = 10, int? clientId = null, string? status = null, string? search = null);
    Task<DocumentDto> CreateAsync(CreateDocumentDto createDocumentDto, string? currentUserId = null);
    Task<DocumentDto> UpdateAsync(int id, UpdateDocumentDto updateDocumentDto, string? currentUserId = null);
    Task<bool> DeleteAsync(int id);
    Task<bool> UploadDocumentAsync(int id, string fileName, long fileSize, string fileType, string? currentUserId = null);
    Task<List<DocumentDto>> GetByClientAsync(int clientId);
    Task<List<DocumentDto>> GetByStatusAsync(string status);
    Task<List<DocumentDto>> GetOverdueDocumentsAsync();
    Task<DocumentStatsDto> GetStatsAsync();
    Task<DocumentStatsDto> GetStatsByClientAsync(int clientId);
    Task<string> UploadFileAsync(IFormFile file);
    string GetFileUrl(string fileName);
    Task<bool> DeleteFileAsync(string fileName);
    bool FileExists(string fileName);
    Task<DocumentListDto> GetDocumentsByStatusAsync(string status, int pageNumber = 1, int pageSize = 10);
    Task<DocumentStatusSummaryDto> GetDocumentStatusSummaryAsync();
} 