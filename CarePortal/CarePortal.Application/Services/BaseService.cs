using CarePortal.Application.Repository;
using CarePortal.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace CarePortal.Application.Services;

public abstract class BaseService
{
    protected readonly IUnitOfWork _unitOfWork;
    protected readonly UserManager<ApplicationUser> _userManager;

    protected BaseService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
    }

    protected async Task<ApplicationUser?> GetCurrentUserAsync(string? currentUserId)
    {
        if (string.IsNullOrEmpty(currentUserId))
            return null;

        return await _userManager.FindByIdAsync(currentUserId);
    }

    protected async Task<bool> ValidateCurrentUserAsync(string? currentUserId)
    {
        if (string.IsNullOrEmpty(currentUserId))
            return false;

        var user = await _userManager.FindByIdAsync(currentUserId);
        return user != null && user.IsActive;
    }

    protected async Task<bool> IsUserInRoleAsync(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        return await _userManager.IsInRoleAsync(user, role);
    }

    protected async Task<bool> IsAdminAsync(string userId)
    {
        return await IsUserInRoleAsync(userId, "Admin");
    }

    protected async Task<bool> IsStaffAsync(string userId)
    {
        return await IsUserInRoleAsync(userId, "Staff");
    }

    protected async Task<bool> CanAccessResourceAsync(string resourceUserId, string? currentUserId)
    {
        if (string.IsNullOrEmpty(currentUserId))
            return false;

        // Admin can access all resources
        if (await IsAdminAsync(currentUserId))
            return true;

        // Users can access their own resources
        return resourceUserId == currentUserId;
    }

    protected async Task<bool> CanModifyResourceAsync(string resourceUserId, string? currentUserId)
    {
        if (string.IsNullOrEmpty(currentUserId))
            return false;

        // Admin can modify all resources
        if (await IsAdminAsync(currentUserId))
            return true;

        // Users can modify their own resources
        return resourceUserId == currentUserId;
    }

    protected async Task SaveChangesAsync()
    {
        await _unitOfWork.SaveChangesAsync();
    }

    protected async Task BeginTransactionAsync()
    {
        await _unitOfWork.BeginTransactionAsync();
    }

    protected async Task CommitTransactionAsync()
    {
        await _unitOfWork.CommitTransactionAsync();
    }

    protected async Task RollbackTransactionAsync()
    {
        await _unitOfWork.RollbackTransactionAsync();
    }

    protected async Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation)
    {
        try
        {
            await BeginTransactionAsync();
            var result = await operation();
            await CommitTransactionAsync();
            return result;
        }
        catch
        {
            await RollbackTransactionAsync();
            throw;
        }
    }

    protected async Task ExecuteInTransactionAsync(Func<Task> operation)
    {
        try
        {
            await BeginTransactionAsync();
            await operation();
            await CommitTransactionAsync();
        }
        catch
        {
            await RollbackTransactionAsync();
            throw;
        }
    }
} 