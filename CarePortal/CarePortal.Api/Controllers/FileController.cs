using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarePortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FileController : BaseController
{
    private readonly IFileUploadService _fileUploadService;

    public FileController(IFileUploadService fileUploadService)
    {
        _fileUploadService = fileUploadService;
    }

    [HttpPost("upload/incident")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<FileUploadResponseDto>> UploadIncidentFile([FromForm] UploadFileDto dto)
    {
        try
        {
            var fileName = await _fileUploadService.UploadPhotoAsync(dto.File);
            var fileUrl = _fileUploadService.GetPhotoUrl(fileName);
            
            var response = new FileUploadResponseDto
            {
                FileName = fileName,
                FileUrl = fileUrl,
                OriginalFileName = dto.File.FileName,
                FileSize = dto.File.Length,
                FileType = Path.GetExtension(dto.File.FileName).ToLowerInvariant()
            };
            
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An error occurred while uploading the incident file" });
        }
    }

    [HttpGet("download/incident/{fileName}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> DownloadIncidentFile(string fileName)
    {
        try
        {
            var incidentPath = Path.Combine("C:\\CarePortalincidentUploadFile", fileName);
            
            if (!System.IO.File.Exists(incidentPath))
            {
                return NotFound(new { error = "Incident file not found" });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(incidentPath);
            var contentType = GetContentType(fileName);
            
            return File(fileBytes, contentType, fileName);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An error occurred while downloading the incident file" });
        }
    }

    [HttpDelete("incident/{fileName}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> DeleteIncidentFile(string fileName)
    {
        try
        {
            var result = await _fileUploadService.DeletePhotoAsync(fileName);
            if (!result)
            {
                return NotFound(new { error = "Incident file not found" });
            }
            
            return NoContent();
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An error occurred while deleting the incident file" });
        }
    }

    [HttpPost("upload/document")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<FileUploadResponseDto>> UploadDocumentFile([FromForm] UploadFileDto dto)
    {
        try
        {
            var fileName = await _fileUploadService.UploadFileAsync(dto.File);
            var fileUrl = _fileUploadService.GetFileUrl(fileName);

            var response = new FileUploadResponseDto
            {
                FileName = fileName,
                FileUrl = fileUrl,
                OriginalFileName = dto.File.FileName,
                FileSize = dto.File.Length,
                FileType = Path.GetExtension(dto.File.FileName).ToLowerInvariant()
            };

            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An error occurred while uploading the incident file" });
        }
    }

    [HttpGet("download/document/{fileName}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> DownloadDocumentFile(string fileName)
    {
        try
        {
            var incidentPath = Path.Combine("C:\\CarePortalDocumentUploadFile", fileName);

            if (!System.IO.File.Exists(incidentPath))
            {
                return NotFound(new { error = "Incident file not found" });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(incidentPath);
            var contentType = GetContentType(fileName);

            return File(fileBytes, contentType, fileName);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An error occurred while downloading the incident file" });
        }
    }

    [HttpDelete("document/{fileName}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> DeleteDocumentFile(string fileName)
    {
        try
        {
            var result = await _fileUploadService.DeletePhotoAsync(fileName);
            if (!result)
            {
                return NotFound(new { error = "Incident file not found" });
            }

            return NoContent();
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An error occurred while deleting the incident file" });
        }
    }

    [HttpGet("info/{fileName}")]
    [Authorize(Roles = "Admin,Staff")]
    public ActionResult<FileInfoDto> GetFileInfo(string fileName)
    {
        try
        {
            if (!_fileUploadService.FileExists(fileName))
            {
                return NotFound(new { error = "File not found" });
            }

            var fullPath = _fileUploadService.GetFullFilePath(fileName);
            var fileInfo = new FileInfo(fullPath);
            
            var response = new FileInfoDto
            {
                FileName = fileName,
                FileUrl = _fileUploadService.GetFileUrl(fileName),
                FileSize = fileInfo.Length,
                FileType = Path.GetExtension(fileName).ToLowerInvariant(),
                CreatedAt = fileInfo.CreationTime,
                LastModified = fileInfo.LastWriteTime
            };
            
            return Ok(response);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "An error occurred while getting file information" });
        }
    }

    private string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            _ => "application/octet-stream"
        };
    }
}
