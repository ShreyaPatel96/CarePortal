using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CarePortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientController : BaseController
{
    private readonly IClientService _clientService;

    public ClientController(IClientService clientService)
    {
        _clientService = clientService ?? throw new ArgumentNullException(nameof(clientService));
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ClientListDto>> GetAll(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 10, 
        [FromQuery] string? search = null)
    {
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        if (IsAdmin)
        {
            return Ok(await _clientService.GetAllAsync(pageNumber, pageSize, search));
        }

        var staffId = CurrentUserId;
        if (string.IsNullOrEmpty(staffId))
        {
            return Forbid();
        }

        var clients = await _clientService.GetByStaffAsync(staffId);
        return Ok(new ClientListDto 
        { 
            Clients = clients, 
            TotalCount = clients.Count, 
            PageNumber = 1, 
            PageSize = clients.Count 
        });
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ClientDto>> GetById(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Invalid client ID");
        }

        var client = await _clientService.GetByIdAsync(id);
        if (client == null)
        {
            return NotFound();
        }

        if (!IsAdmin && client.AssignedStaffId != CurrentUserId)
        {
            return Forbid();
        }

        return Ok(client);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ClientDto>> Create([FromBody] CreateClientDto dto)
    {
        if (dto == null)
        {
            return BadRequest("Client data is required");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var client = await _clientService.CreateAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<ClientDto>> Update(int id, [FromBody] UpdateClientDto dto)
    {
        if (id <= 0)
        {
            return BadRequest("Invalid client ID");
        }

        if (dto == null)
        {
            return BadRequest("Update data is required");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var client = await _clientService.UpdateAsync(id, dto, CurrentUserId);
        return Ok(client);
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Invalid client ID");
        }

        var result = await _clientService.DeleteAsync(id);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpPost("{id:int}/toggle-active")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleActive(int id)
    {
        if (id <= 0)
        {
            return BadRequest("Invalid client ID");
        }

        var result = await _clientService.ToggleActiveStatusAsync(id, CurrentUserId);
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
} 