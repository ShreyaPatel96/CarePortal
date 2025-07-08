using System.ComponentModel.DataAnnotations;

namespace CarePortal.Application.DTOs;

public class ClientDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public bool IsActive { get; set; }
    public string? AssignedStaffId { get; set; }
    public string? AssignedStaffName { get; set; }
}

public class CreateClientDto
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;
    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    [Required]
    public DateTime DateOfBirth { get; set; }
    [StringLength(500)]
    public string Address { get; set; } = string.Empty;
    [StringLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;
    [EmailAddress]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;
    public string? AssignedStaffId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UpdateClientDto
{
    [StringLength(100)]
    public string? FirstName { get; set; }
    [StringLength(100)]
    public string? LastName { get; set; }
    public DateTime? DateOfBirth { get; set; }
    [StringLength(500)]
    public string? Address { get; set; }
    [StringLength(20)]
    public string? PhoneNumber { get; set; }
    [EmailAddress]
    [StringLength(100)]
    public string? Email { get; set; }
    public string? AssignedStaffId { get; set; }
    public bool? IsActive { get; set; }
}

public class ClientListDto
{
    public List<ClientDto> Clients { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
} 