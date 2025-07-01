using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarePortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JobTimeController : BaseController
{
    private readonly IJobTimeService _jobTimeService;

    public JobTimeController(IJobTimeService jobTimeService)
    {
        _jobTimeService = jobTimeService;
    }

    [HttpGet]
    public async Task<ActionResult<JobTimeListDto>> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] int? clientId = null)
    {
        if (IsAdmin)
            return Ok(await _jobTimeService.GetAllAsync(pageNumber, pageSize, null, clientId));
        var staffId = CurrentUserId;
        if (staffId == null) return Forbid();
        return Ok(await _jobTimeService.GetAllAsync(pageNumber, pageSize, staffId, clientId));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<JobTimeDto>> GetById(int id)
    {
        var job = await _jobTimeService.GetByIdAsync(id);
        if (job == null) return NotFound();
        if (!IsAdmin && job.StaffId != CurrentUserId)
            return Forbid();
        return Ok(job);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<JobTimeDto>> Create([FromBody] CreateJobTimeDto dto)
    {
        if (!IsAdmin && dto.StaffId != CurrentUserId)
            return Forbid();
        var job = await _jobTimeService.CreateAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = job.Id }, job);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<JobTimeDto>> Update(int id, [FromBody] UpdateJobTimeDto dto)
    {
        var job = await _jobTimeService.GetByIdAsync(id);
        if (job == null) return NotFound();
        if (!IsAdmin && job.StaffId != CurrentUserId)
            return Forbid();
        var updated = await _jobTimeService.UpdateAsync(id, dto, CurrentUserId);
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> Delete(int id)
    {
        var job = await _jobTimeService.GetByIdAsync(id);
        if (job == null) return NotFound();
        if (!IsAdmin && job.StaffId != CurrentUserId)
            return Forbid();
        var result = await _jobTimeService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }
}