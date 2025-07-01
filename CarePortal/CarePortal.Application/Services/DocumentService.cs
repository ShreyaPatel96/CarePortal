using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using Microsoft.AspNetCore.Http;

namespace CarePortal.Application.Services;

public class DocumentService : IDocumentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileUploadService _fileUploadService;

    public DocumentService(IUnitOfWork unitOfWork, IFileUploadService fileUploadService)
    {
        _unitOfWork = unitOfWork;
        _fileUploadService = fileUploadService;
    }

    public async Task<DocumentDto?> GetByIdAsync(int id)
    {
        var document = await _unitOfWork.Repository<ClientDocument>().GetByIdAsync(id);

        if (document == null) return null;

        // Load related data
        var client = await _unitOfWork.Repository<Client>().GetByIdAsync(document.ClientId);
        
        // Get user's full name if UploadedBy contains a user ID
        string uploadedByName = document.UploadedBy;
        if (!string.IsNullOrEmpty(document.UploadedBy) && document.UploadedBy != "System")
        {
            var user = await _unitOfWork.Repository<ApplicationUser>().GetByIdAsync(document.UploadedBy);
            if (user != null)
            {
                uploadedByName = user.FullName;
            }
        }

        return new DocumentDto
        {
            Id = document.Id,
            ClientId = document.ClientId,
            ClientName = client != null ? $"{client.FirstName} {client.LastName}" : "Unknown Client",
            Title = document.Title,
            Description = document.Description,
            FileName = document.FileName,
            FileType = document.FileType,
            CreatedAt = document.CreatedAt,
            UploadedBy = uploadedByName,
            IsActive = document.IsActive,
            Deadline = document.Deadline,
            Status = DetermineStatus(document.Deadline, document.FileName)
        };
    }

    public async Task<DocumentListDto> GetAllAsync(int pageNumber = 1, int pageSize = 10, int? clientId = null, string? status = null, string? search = null)
    {
        var query = _unitOfWork.Repository<ClientDocument>().GetAll();

        if (clientId.HasValue)
            query = query.Where(d => d.ClientId == clientId.Value);

        if (!string.IsNullOrEmpty(search))
        {
            // Search by document title or client name
            query = query.Where(d => 
                d.Title.Contains(search) || 
                d.Client.FirstName.Contains(search) || 
                d.Client.LastName.Contains(search) ||
                (d.Client.FirstName + " " + d.Client.LastName).Contains(search)
            );
        }

        if (!string.IsNullOrEmpty(status))
        {
            var todayUtc = DateTime.UtcNow.Date;

            // Apply status filtering based on business logic
            switch (status.ToLower())
            {
                case "pending":
                    query = query.Where(d => 
                        (d.Deadline.Date > todayUtc) || 
                        (d.Deadline.Date == todayUtc && string.IsNullOrEmpty(d.FileName) && d.Status == "pending")
                    );
                    break;
                case "uploaded":
                    query = query.Where(d => 
                        !string.IsNullOrEmpty(d.FileName) && d.Deadline.Date == todayUtc && d.Status == "upload"
                    );
                    break;
                case "overdue":
                    query = query.Where(d => 
                        d.Deadline.Date < todayUtc && d.Status == "overdue"
                    );
                    break;
                default:
                    // Return all documents if status is not specified
                    break;
            }
        }

        var totalCount = query.Count();
        var documents = query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var documentDtos = new List<DocumentDto>();
        foreach (var document in documents)
        {
            var client = await _unitOfWork.Repository<Client>().GetByIdAsync(document.ClientId);
            
            // Get user's full name if UploadedBy contains a user ID
            string uploadedByName = document.UploadedBy;
            if (!string.IsNullOrEmpty(document.UploadedBy) && document.UploadedBy != "System")
            {
                var user = await _unitOfWork.Repository<ApplicationUser>().GetByIdAsync(document.UploadedBy);
                if (user != null)
                {
                    uploadedByName = user.FullName;
                }
            }

            documentDtos.Add(new DocumentDto
            {
                Id = document.Id,
                ClientId = document.ClientId,
                ClientName = client != null ? $"{client.FirstName} {client.LastName}" : "Unknown Client",
                Title = document.Title,
                Description = document.Description,
                FileName = document.FileName,
                FileType = document.FileType,
                CreatedAt = document.CreatedAt,
                UploadedBy = uploadedByName,
                IsActive = document.IsActive,
                Deadline = document.Deadline,
                Status = DetermineStatus(document.Deadline, document.FileName)
            });
        }

        return new DocumentListDto
        {
            Documents = documentDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<DocumentDto> CreateAsync(CreateDocumentDto createDocumentDto, string? currentUserId = null)
    {
        var document = new ClientDocument
        {
            ClientId = createDocumentDto.ClientId,
            Title = createDocumentDto.Title,
            Description = createDocumentDto.Description,
            FileName = string.Empty, // Will be set when file is uploaded
            FileType = string.Empty, // Will be set when file is uploaded
            UploadedBy = currentUserId ?? "System",
            Deadline = createDocumentDto.Deadline,
            Status = DetermineStatus(createDocumentDto.Deadline, string.Empty), // Auto-determine status based on deadline
            IsActive = createDocumentDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserId,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = currentUserId
        };

        _unitOfWork.Repository<ClientDocument>().Add(document);
        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(document.Id) ?? throw new InvalidOperationException("Failed to retrieve created document");
    }

    public async Task<DocumentDto> UpdateAsync(int id, UpdateDocumentDto updateDocumentDto, string? currentUserId = null)
    {
        var document = await _unitOfWork.Repository<ClientDocument>().GetByIdAsync(id);
        if (document == null)
            throw new InvalidOperationException("Document not found");

        if (!string.IsNullOrEmpty(updateDocumentDto.Title))
            document.Title = updateDocumentDto.Title;

        if (!string.IsNullOrEmpty(updateDocumentDto.Description))
            document.Description = updateDocumentDto.Description;

        if (updateDocumentDto.Deadline.HasValue)
        {
            document.Deadline = updateDocumentDto.Deadline.Value;
            // Recalculate status when deadline changes
            document.Status = DetermineStatus(document.Deadline, document.FileName);
        }

        if (!string.IsNullOrEmpty(updateDocumentDto.Status))
            document.Status = updateDocumentDto.Status;

        if (updateDocumentDto.IsActive.HasValue)
            document.IsActive = updateDocumentDto.IsActive.Value;

        document.UpdatedAt = DateTime.UtcNow;
        document.UpdatedBy = currentUserId;

        _unitOfWork.Repository<ClientDocument>().Update(document);
        await _unitOfWork.SaveChangesAsync();

        return await GetByIdAsync(id) ?? throw new InvalidOperationException("Failed to retrieve updated document");
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var document = await _unitOfWork.Repository<ClientDocument>().GetByIdAsync(id);
        if (document == null) return false;

        // Delete associated file if exists
        if (!string.IsNullOrEmpty(document.FileName))
        {
            await _fileUploadService.DeleteFileAsync(document.FileName);
        }

        _unitOfWork.Repository<ClientDocument>().Delete(document);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UploadDocumentAsync(int id, string fileName, long fileSize, string fileType, string? currentUserId = null)
    {
        var document = await _unitOfWork.Repository<ClientDocument>().GetByIdAsync(id);
        if (document == null) return false;

        // Delete old file if exists
        if (!string.IsNullOrEmpty(document.FileName))
        {
            await _fileUploadService.DeleteFileAsync(document.FileName);
        }

        document.FileName = fileName;
        document.FileType = fileType;
        document.Status = DetermineStatus(document.Deadline, fileName); // Auto-determine status based on deadline and file
        document.UploadedBy = currentUserId ?? "System";
        document.UpdatedAt = DateTime.UtcNow;
        document.UpdatedBy = currentUserId;

        _unitOfWork.Repository<ClientDocument>().Update(document);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<List<DocumentDto>> GetByClientAsync(int clientId)
    {
        var documents = _unitOfWork.Repository<ClientDocument>().GetAll()
            .Where(d => d.ClientId == clientId)
            .OrderByDescending(d => d.CreatedAt)
            .ToList();

        var documentDtos = new List<DocumentDto>();
        foreach (var document in documents)
        {
            var client = await _unitOfWork.Repository<Client>().GetByIdAsync(document.ClientId);
            
            // Get user's full name if UploadedBy contains a user ID
            string uploadedByName = document.UploadedBy;
            if (!string.IsNullOrEmpty(document.UploadedBy) && document.UploadedBy != "System")
            {
                var user = await _unitOfWork.Repository<ApplicationUser>().GetByIdAsync(document.UploadedBy);
                if (user != null)
                {
                    uploadedByName = user.FullName;
                }
            }

            documentDtos.Add(new DocumentDto
            {
                Id = document.Id,
                ClientId = document.ClientId,
                ClientName = client != null ? $"{client.FirstName} {client.LastName}" : "Unknown Client",
                Title = document.Title,
                Description = document.Description,
                FileName = document.FileName,
                FileType = document.FileType,
                CreatedAt = document.CreatedAt,
                UploadedBy = uploadedByName,
                IsActive = document.IsActive,
                Deadline = document.Deadline,
                Status = DetermineStatus(document.Deadline, document.FileName)
            });
        }

        return documentDtos;
    }

    public async Task<List<DocumentDto>> GetByStatusAsync(string status)
    {
        var query = _unitOfWork.Repository<ClientDocument>().GetAll();
        var todayUtc = DateTime.UtcNow.Date;

        // Apply status filtering based on business logic
        switch (status.ToLower())
        {
            case "pending":
                query = query.Where(d => 
                    (d.Deadline.Date > todayUtc) || 
                    (d.Deadline.Date == todayUtc && string.IsNullOrEmpty(d.FileName) && d.Status == "pending")
                );
                break;
            case "uploaded":
                query = query.Where(d => 
                    !string.IsNullOrEmpty(d.FileName) && d.Deadline.Date == todayUtc && d.Status == "upload"
                );
                break;
            case "overdue":
                query = query.Where(d => 
                    d.Deadline.Date < todayUtc && d.Status == "overdue"
                );
                break;  
            default:
                // Return all documents if status is not specified
                break;
        }

        var documents = query
            .OrderByDescending(d => d.CreatedAt)
            .ToList();

        var documentDtos = new List<DocumentDto>();
        foreach (var document in documents)
        {
            var client = await _unitOfWork.Repository<Client>().GetByIdAsync(document.ClientId);
            
            // Get user's full name if UploadedBy contains a user ID
            string uploadedByName = document.UploadedBy;
            if (!string.IsNullOrEmpty(document.UploadedBy) && document.UploadedBy != "System")
            {
                var user = await _unitOfWork.Repository<ApplicationUser>().GetByIdAsync(document.UploadedBy);
                if (user != null)
                {
                    uploadedByName = user.FullName;
                }
            }

            documentDtos.Add(new DocumentDto
            {
                Id = document.Id,
                ClientId = document.ClientId,
                ClientName = client != null ? $"{client.FirstName} {client.LastName}" : "Unknown Client",
                Title = document.Title,
                Description = document.Description,
                FileName = document.FileName,
                FileType = document.FileType,
                CreatedAt = document.CreatedAt,
                UploadedBy = uploadedByName,
                IsActive = document.IsActive,
                Deadline = document.Deadline,
                Status = DetermineStatus(document.Deadline, document.FileName)
            });
        }

        return documentDtos;
    }

    public async Task<List<DocumentDto>> GetOverdueDocumentsAsync()
    {
        var todayUtc = DateTime.UtcNow.Date;
        var documents = _unitOfWork.Repository<ClientDocument>().GetAll()
            .Where(d => d.Deadline.Date < todayUtc)
            .OrderBy(d => d.Deadline)
            .ToList();

        var documentDtos = new List<DocumentDto>();
        foreach (var document in documents)
        {
            var client = await _unitOfWork.Repository<Client>().GetByIdAsync(document.ClientId);
            
            // Get user's full name if UploadedBy contains a user ID
            string uploadedByName = document.UploadedBy;
            if (!string.IsNullOrEmpty(document.UploadedBy) && document.UploadedBy != "System")
            {
                var user = await _unitOfWork.Repository<ApplicationUser>().GetByIdAsync(document.UploadedBy);
                if (user != null)
                {
                    uploadedByName = user.FullName;
                }
            }

            documentDtos.Add(new DocumentDto
            {
                Id = document.Id,
                ClientId = document.ClientId,
                ClientName = client != null ? $"{client.FirstName} {client.LastName}" : "Unknown Client",
                Title = document.Title,
                Description = document.Description,
                FileName = document.FileName,
                FileType = document.FileType,
                CreatedAt = document.CreatedAt,
                UploadedBy = uploadedByName,
                IsActive = document.IsActive,
                Deadline = document.Deadline,
                Status = "overdue"
            });
        }

        return documentDtos;
    }

    public async Task<DocumentStatsDto> GetStatsAsync()
    {
        var documents = _unitOfWork.Repository<ClientDocument>().GetAll().ToList();
        
        var stats = new DocumentStatsDto
        {
            TotalDocuments = documents.Count,
            PendingDocuments = documents.Count(d => DetermineStatus(d.Deadline, d.FileName) == "pending"),
            UploadDocuments = documents.Count(d => DetermineStatus(d.Deadline, d.FileName) == "upload"),
            OverdueDocuments = documents.Count(d => DetermineStatus(d.Deadline, d.FileName) == "overdue")
        };

        return stats;
    }

    public async Task<DocumentStatsDto> GetStatsByClientAsync(int clientId)
    {
        var documents = _unitOfWork.Repository<ClientDocument>().GetAll()
            .Where(d => d.ClientId == clientId)
            .ToList();
        
        var stats = new DocumentStatsDto
        {
            TotalDocuments = documents.Count,
            PendingDocuments = documents.Count(d => DetermineStatus(d.Deadline, d.FileName) == "pending"),
            UploadDocuments = documents.Count(d => DetermineStatus(d.Deadline, d.FileName) == "upload"),
            OverdueDocuments = documents.Count(d => DetermineStatus(d.Deadline, d.FileName) == "overdue")
        };

        return stats;
    }

    public async Task<string> UploadFileAsync(IFormFile file)
    {
        return await _fileUploadService.UploadFileAsync(file);
    }

    public string GetFileUrl(string fileName)
    {
        return _fileUploadService.GetFileUrl(fileName);
    }

    public async Task<bool> DeleteFileAsync(string fileName)
    {
        return await _fileUploadService.DeleteFileAsync(fileName);
    }

    public bool FileExists(string fileName)
    {
        return _fileUploadService.FileExists(fileName);
    }

    // Helper method to determine status based on deadline and file presence
    private static string DetermineStatus(DateTime deadline, string fileName)
    {
        // Get current UTC date (start of day) for consistent comparison
        var todayUtc = DateTime.UtcNow.Date;
        
        // Convert deadline to UTC date for comparison
        var deadlineUtc = deadline.Date;
        
        // If deadline is in the past, status is "overdue"
        if (deadlineUtc < todayUtc)
        {
            return "overdue";
        }
        // If deadline is today and file is uploaded, status is "upload"
        else if (deadlineUtc == todayUtc && !string.IsNullOrEmpty(fileName))
        {
            return "upload";
        }
        // If deadline is in the future or today without file, status is "pending"
        else
        {
            return "pending";
        }
    }

    // Method to get documents by status with filtering
    public async Task<DocumentListDto> GetDocumentsByStatusAsync(string status, int pageNumber = 1, int pageSize = 10)
    {
        var query = _unitOfWork.Repository<ClientDocument>().GetAll();
        var today = DateTime.UtcNow.Date;

        // Apply status filtering based on business logic
        switch (status.ToLower())
        {
            case "pending":
                query = query.Where(d => 
                    (d.Deadline.Date > today) || 
                    (d.Deadline.Date == today && string.IsNullOrEmpty(d.FileName) && d.Status == "pending"   )
                );
                break;
            case "uploaded":
                query = query.Where(d => 
                    !string.IsNullOrEmpty(d.FileName) && d.Deadline.Date == today && d.Status == "upload"
                );
                break;
            case "overdue":
                query = query.Where(d => 
                    d.Deadline.Date < today && d.Status == "overdue"
                );
                break;
            default:
                // Return all documents if status is not specified
                break;
        }

        var totalCount = query.Count();
        var documents = query
            .OrderByDescending(d => d.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var documentDtos = new List<DocumentDto>();
        foreach (var document in documents)
        {
            var client = await _unitOfWork.Repository<Client>().GetByIdAsync(document.ClientId);
            
            // Get user's full name if UploadedBy contains a user ID
            string uploadedByName = document.UploadedBy;
            if (!string.IsNullOrEmpty(document.UploadedBy) && document.UploadedBy != "System")
            {
                var user = await _unitOfWork.Repository<ApplicationUser>().GetByIdAsync(document.UploadedBy);
                if (user != null)
                {
                    uploadedByName = user.FullName;
                }
            }

            documentDtos.Add(new DocumentDto
            {
                Id = document.Id,
                ClientId = document.ClientId,
                ClientName = client != null ? $"{client.FirstName} {client.LastName}" : "Unknown Client",
                Title = document.Title,
                Description = document.Description,
                FileName = document.FileName,
                FileType = document.FileType,
                CreatedAt = document.CreatedAt,
                UploadedBy = uploadedByName,
                IsActive = document.IsActive,
                Deadline = document.Deadline,
                Status = DetermineStatus(document.Deadline, document.FileName)
            });
        }

        return new DocumentListDto
        {
            Documents = documentDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    // Method to get document status summary
    public async Task<DocumentStatusSummaryDto> GetDocumentStatusSummaryAsync()
    {
        var documents = _unitOfWork.Repository<ClientDocument>().GetAll().ToList();
        
        var summary = new DocumentStatusSummaryDto
        {
            Total = documents.Count,
            Pending = documents.Count(d => DetermineStatus(d.Deadline, d.FileName) == "pending"),
            Upload = documents.Count(d => DetermineStatus(d.Deadline, d.FileName) == "upload"),
            Overdue = documents.Count(d => DetermineStatus(d.Deadline, d.FileName) == "overdue")
        };

        return summary;
    }
} 