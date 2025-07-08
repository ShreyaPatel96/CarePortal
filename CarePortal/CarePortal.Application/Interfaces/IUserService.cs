using CarePortal.Application.DTOs;

namespace CarePortal.Application.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetByIdAsync(string id);
    Task<UserListDto> GetAllAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null);
    Task<UserDto> CreateAsync(CreateUserDto createUserDto, string? currentUserId = null);
    Task<UserDto> UpdateAsync(string id, UpdateUserDto updateUserDto, string? currentUserId = null);
    Task<bool> DeleteAsync(string id);
    Task<bool> ChangePasswordAsync(string id, string currentPassword, string newPassword, string? currentUserId = null);
    Task<bool> ToggleActiveStatusAsync(string id, string? currentUserId = null);
} 