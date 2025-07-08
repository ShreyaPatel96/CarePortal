using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

    [HttpPost("upload")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<FileInfoDto>> UploadFile(IFormFile file, string uploadType = "document")
    {
        try
        {
            // Validate upload type
            if (!IsValidUploadType(uploadType))
            {
                return BadRequest(new { error = "Invalid upload type. Valid types are 'document' and 'incident'" });
            }

            var fileName = await _fileUploadService.UploadFileAsync(file, uploadType);
            
            var response = new FileInfoDto
            {
                FileName = fileName,
                OriginalFileName = file.FileName,
                FileSize = file.Length,
                FileType = Path.GetExtension(file.FileName).ToLowerInvariant(),
                UploadType = uploadType,
                CreatedAt = DateTime.UtcNow,
                LastModified = DateTime.UtcNow
            };
            
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception)
        {
            var fileTypeText = uploadType == "incident" ? "incident" : "document";
            return StatusCode(500, new { error = $"An error occurred while uploading the {fileTypeText} file" });
        }
    }

    [HttpGet("download")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DownloadFile(string fileName, string uploadType = "document")
    {
        try
        {
            // Validate upload type
            if (!IsValidUploadType(uploadType))
            {
                return BadRequest(new { error = "Invalid upload type. Valid types are 'document' and 'incident'" });
            }

            var filePath = _fileUploadService.DownloadFileAsync(fileName, uploadType);

            if (!System.IO.File.Exists(filePath))
            {
                var fileTypeText = uploadType == "incident" ? "incident" : "document";
                return NotFound(new { error = $"{fileTypeText} file not found" });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var contentType = GetContentType(fileName);
            
            return File(fileBytes, contentType, fileName);
        }
        catch (Exception)
        {
            var fileTypeText = uploadType == "incident" ? "incident" : "document";
            return StatusCode(500, new { error = $"An error occurred while downloading the {fileTypeText} file" });
        }
    }

    [HttpDelete("{fileName}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteFile(string fileName, string uploadType = "document")
    {
        try
        {
            // Validate upload type
            if (!IsValidUploadType(uploadType))
            {
                return BadRequest(new { error = "Invalid upload type. Valid types are 'document' and 'incident'" });
            }

            var result = await _fileUploadService.DeleteFileAsync(fileName, uploadType);
            if (!result)
            {
                var fileTypeText = uploadType == "incident" ? "incident" : "document";
                return NotFound(new { error = $"{fileTypeText} file not found" });
            }
            
            return NoContent();
        }
        catch (Exception)
        {
            var fileTypeText = uploadType == "incident" ? "incident" : "document";
            return StatusCode(500, new { error = $"An error occurred while deleting the {fileTypeText} file" });
        }
    }

    private bool IsValidUploadType(string uploadType)
    {
        return uploadType?.ToLowerInvariant() is "document" or "incident";
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
