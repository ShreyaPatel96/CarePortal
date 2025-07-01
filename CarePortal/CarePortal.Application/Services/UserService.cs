using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using CarePortal.Domain.Entities;
using CarePortal.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace CarePortal.Application.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public UserService(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<UserDto?> GetByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? UserRole.Staff.GetRoleName();
        
        return new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!,
            Role = role,
            RoleDisplayName = GetRoleDisplayName(role),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    public async Task<UserDto?> GetByEmailAsync(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? UserRole.Staff.GetRoleName();
        
        return new UserDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!,
            Role = role,
            RoleDisplayName = GetRoleDisplayName(role),
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            LastLoginAt = user.LastLoginAt
        };
    }

    public async Task<UserListDto> GetAllAsync(int pageNumber = 1, int pageSize = 10, string? searchTerm = null)
    {
        var query = _userManager.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(u => 
                u.FirstName.Contains(searchTerm) || 
                u.LastName.Contains(searchTerm) || 
                u.Email!.Contains(searchTerm));
        }

        var totalCount = query.Count();
        var users = query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var userDtos = new List<UserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? UserRole.Staff.GetRoleName();
            
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email!,
                Role = role,
                RoleDisplayName = GetRoleDisplayName(role),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            });
        }

        return new UserListDto
        {
            Users = userDtos,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<UserDto> CreateAsync(CreateUserDto createUserDto, string? currentUserId = null)
    {
        var user = new ApplicationUser
        {
            UserName = createUserDto.Email,
            Email = createUserDto.Email,
            FirstName = createUserDto.FirstName,
            LastName = createUserDto.LastName,
            IsActive = createUserDto.IsActive,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUserId
        };

        var result = await _userManager.CreateAsync(user, createUserDto.Password);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to create user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        // Set default role if none specified
        var roleToAssign = !string.IsNullOrEmpty(createUserDto.Role) ? createUserDto.Role : UserRole.Staff.GetRoleName();
        
        // Ensure the role exists before adding it
        if (await _roleManager.RoleExistsAsync(roleToAssign))
        {
            await _userManager.AddToRoleAsync(user, roleToAssign);
        }
        else
        {
            // Create the role if it doesn't exist
            var role = new ApplicationRole
            {
                Name = roleToAssign,
                Description = $"{roleToAssign} role for CarePortal",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            await _roleManager.CreateAsync(role);
            await _userManager.AddToRoleAsync(user, roleToAssign);
        }

        return await GetByIdAsync(user.Id) ?? throw new InvalidOperationException("Failed to retrieve created user");
    }

    public async Task<UserDto> UpdateAsync(string id, UpdateUserDto updateUserDto, string? currentUserId = null)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new InvalidOperationException("User not found");

        if (!string.IsNullOrEmpty(updateUserDto.FirstName))
            user.FirstName = updateUserDto.FirstName;

        if (!string.IsNullOrEmpty(updateUserDto.LastName))
            user.LastName = updateUserDto.LastName;

        if (!string.IsNullOrEmpty(updateUserDto.Email))
        {
            user.Email = updateUserDto.Email;
            user.UserName = updateUserDto.Email;
        }

        if (updateUserDto.IsActive.HasValue)
            user.IsActive = updateUserDto.IsActive.Value;

        if (!string.IsNullOrEmpty(updateUserDto.Role))
        {
            var currentRoles = await _userManager.GetRolesAsync(user);
            
            // Only update roles if the new role is different from the current role
            if (!currentRoles.Contains(updateUserDto.Role))
            {
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                
                // Ensure the role exists before adding it
                if (await _roleManager.RoleExistsAsync(updateUserDto.Role))
                {
                    await _userManager.AddToRoleAsync(user, updateUserDto.Role);
                }
                else
                {
                    // Create the role if it doesn't exist
                    var role = new ApplicationRole
                    {
                        Name = updateUserDto.Role,
                        Description = $"{updateUserDto.Role} role for CarePortal",
                        CreatedAt = DateTime.UtcNow,
                        IsActive = true
                    };
                    await _roleManager.CreateAsync(role);
                    await _userManager.AddToRoleAsync(user, updateUserDto.Role);
                }
            }
        }

        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = currentUserId;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            throw new InvalidOperationException($"Failed to update user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
        }

        return await GetByIdAsync(id) ?? throw new InvalidOperationException("Failed to retrieve updated user");
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return false;

        user.IsDeleted = true;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<bool> ChangePasswordAsync(string id, string currentPassword, string newPassword, string? currentUserId = null)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) 
            throw new InvalidOperationException("User not found");

        user.UpdatedBy = currentUserId;
        user.UpdatedAt = DateTime.UtcNow;
        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        
        if (!result.Succeeded)
        {
            var errorMessages = result.Errors.Select(e => e.Description);
            var errorMessage = string.Join(", ", errorMessages);
            
            // Provide more specific error messages
            if (errorMessage.Contains("Incorrect password"))
            {
                throw new InvalidOperationException("Current password is incorrect");
            }
            else if (errorMessage.Contains("Passwords must"))
            {
                throw new InvalidOperationException($"Password validation failed: {errorMessage}");
            }
            else
            {
                throw new InvalidOperationException($"Failed to change password: {errorMessage}");
            }
        }
        
        return result.Succeeded;
    }

    public async Task<bool> ResetPasswordAsync(string email, string newPassword, string? currentUserId = null)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return false;

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        user.UpdatedAt = DateTime.UtcNow;
        user.UpdatedBy = currentUserId;
        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        return result.Succeeded;
    }

    public async Task<bool> ToggleActiveStatusAsync(string id, string? currentUserId = null)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return false;

        user.IsActive = !user.IsActive;
        user.UpdatedBy = currentUserId;
        user.UpdatedAt = DateTime.Now;
        var result = await _userManager.UpdateAsync(user);
        return result.Succeeded;
    }

    public async Task<List<UserDto>> GetByRoleAsync(string role)
    {
        var users = await _userManager.GetUsersInRoleAsync(role);
        
        var userDtos = new List<UserDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var userRole = roles.FirstOrDefault() ?? UserRole.Staff.GetRoleName();
            
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email!,
                Role = userRole,
                RoleDisplayName = GetRoleDisplayName(userRole),
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            });
        }

        return userDtos;
    }

    public async Task<List<string>> GetAllRolesAsync()
    {
        return _roleManager.Roles.Select(r => r.Name!).ToList();
    }

    public async Task<List<UserRoleDto>> GetUserRolesAsync()
    {
        var roles = _roleManager.Roles.ToList();
        var userRoleDtos = new List<UserRoleDto>();
        
        foreach (var role in roles)
        {
            if (Enum.TryParse<UserRole>(role.Name, out var userRole))
            {
                userRoleDtos.Add(new UserRoleDto
                {
                    Value = (int)userRole,
                    Name = role.Name!,
                    DisplayName = userRole.GetDisplayName()
                });
            }
        }
        
        return userRoleDtos;
    }

    private string GetRoleDisplayName(string roleName)
    {
        if (Enum.TryParse<UserRole>(roleName, out var userRole))
        {
            return userRole.GetDisplayName();
        }
        return roleName;
    }

    public async Task<bool> RoleExistsAsync(string roleName)
    {
        return await _roleManager.RoleExistsAsync(roleName);
    }

    public async Task<bool> CreateRoleAsync(string roleName, string? description = null)
    {
        var role = new ApplicationRole
        {
            Name = roleName,
            Description = description
        };

        var result = await _roleManager.CreateAsync(role);
        return result.Succeeded;
    }

    public async Task<bool> DeleteRoleAsync(string roleName)
    {
        var role = await _roleManager.FindByNameAsync(roleName);
        if (role == null) return false;

        var result = await _roleManager.DeleteAsync(role);
        return result.Succeeded;
    }
} 