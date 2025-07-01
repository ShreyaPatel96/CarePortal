using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarePortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentController : BaseController
{
    private readonly IDocumentService _documentService;

    public DocumentController(IDocumentService documentService)
    {
        _documentService = documentService;
    }

    [HttpGet]
    public async Task<ActionResult<DocumentListDto>> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] int? clientId = null, [FromQuery] string? status = null, [FromQuery] string? search = null)
    {
        return Ok(await _documentService.GetAllAsync(pageNumber, pageSize, clientId, status, search));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentDto>> GetById(int id)
    {
        var doc = await _documentService.GetByIdAsync(id);
        if (doc == null) return NotFound();
        return Ok(doc);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<DocumentDto>> Create([FromBody] CreateDocumentDto dto)
    {
        var doc = await _documentService.CreateAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = doc.Id }, doc);
    }

    [HttpPut("{id}/link-file")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<DocumentDto>> LinkFileToDocument(int id, [FromBody] LinkFileToDocumentDto dto)
    {
        try
        {
            var success = await _documentService.UploadDocumentAsync(id, dto.FileName, dto.FileSize, dto.FileType, CurrentUserId);
            if (!success)
            {
                return NotFound(new { error = "Document not found" });
            }

            var document = await _documentService.GetByIdAsync(id);
            if (document == null) return NotFound();

            return Ok(document);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while linking file to document" });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<DocumentDto>> Update(int id, [FromBody] UpdateDocumentDto dto)
    {
        var updated = await _documentService.UpdateAsync(id, dto, CurrentUserId);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _documentService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpGet("status-summary")]
    public async Task<ActionResult<DocumentStatusSummaryDto>> GetStatusSummary()
    {
        return Ok(await _documentService.GetDocumentStatusSummaryAsync());
    }
}