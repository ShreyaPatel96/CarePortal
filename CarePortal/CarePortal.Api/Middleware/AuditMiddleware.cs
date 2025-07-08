using CarePortal.Domain.Entities;
using CarePortal.Persistence.Context;
using Microsoft.EntityFrameworkCore;
using CarePortal.Shared.Constants;

namespace CarePortal.Api.Middleware;

public class AuditMiddleware
{
    private readonly RequestDelegate _next;

    public AuditMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ApplicationDbContext dbContext)
    {
        var userId = GetCurrentUserId(context);
        
        // Set the current user ID for audit purposes
        SetCurrentUserId(context, userId);
        
        await _next(context);
        
        // Update audit fields for modified entities
        await UpdateAuditFieldsAsync(dbContext, userId);
    }

    private static string? GetCurrentUserId(HttpContext context)
    {
        return context.User?.FindFirst(Claims.UserId)?.Value;
    }

    private static void SetCurrentUserId(HttpContext context, string? userId)
    {
        // Store the current user ID in a way that can be accessed by the DbContext
        if (!string.IsNullOrEmpty(userId))
        {
            // You can use HttpContext.Items or a static field to store the current user ID
            context.Items["CurrentUserId"] = userId;
        }
    }

    private static async Task UpdateAuditFieldsAsync(ApplicationDbContext dbContext, string? userId)
    {
        if (string.IsNullOrEmpty(userId)) return;

        var entries = dbContext.ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedBy = userId;
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }
            
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedBy = userId;
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        await dbContext.SaveChangesAsync();
    }
} 