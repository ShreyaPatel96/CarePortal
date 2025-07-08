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
    Task<DocumentStatusSummaryDto> GetDocumentStatusSummaryAsync();
} 