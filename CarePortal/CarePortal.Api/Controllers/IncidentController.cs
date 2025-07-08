using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using CarePortal.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarePortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IncidentController : BaseController
{
    private readonly IIncidentService _incidentService;

    public IncidentController(IIncidentService incidentService)
    {
        _incidentService = incidentService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IncidentListDto>> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] IncidentStatus? status = null, [FromQuery] IncidentSeverity? severity = null)
    {
        return Ok(await _incidentService.GetAllAsync(pageNumber, pageSize, status, severity));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IncidentDto>> GetById(int id)
    {
        var incident = await _incidentService.GetByIdAsync(id);
        if (incident == null) return NotFound();
        return Ok(incident);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IncidentDto>> Create([FromBody] CreateIncidentDto dto)
    {
        var incident = await _incidentService.CreateAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = incident.Id }, incident);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IncidentDto>> Update(int id, [FromBody] UpdateIncidentDto dto)
    {
        var updated = await _incidentService.UpdateAsync(id, dto, CurrentUserId);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _incidentService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}