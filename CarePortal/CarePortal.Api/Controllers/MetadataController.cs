using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace CarePortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MetadataController : BaseController
{
    private readonly IMetadataService _metadataService;
    private readonly ILogger<MetadataController> _logger;

    public MetadataController(IMetadataService metadataService, ILogger<MetadataController> logger)
    {
        _metadataService = metadataService;
        _logger = logger;
    }

    [HttpGet("get-metadata")]
    [Authorize(Roles = "Admin")]
    public ActionResult<List<MetadataListDto>> GetMetadata()
    {
        try
        {
            _logger.LogInformation("MetadataController: Fetching metadata");
            var metadata = _metadataService.GetMetadata();
            _logger.LogInformation("MetadataController: Successfully fetched {Count} metadata types", metadata.Count);
            return Ok(metadata);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "MetadataController: Error fetching metadata");
            return StatusCode(500, "Internal server error while fetching metadata");
        }
    }
} 