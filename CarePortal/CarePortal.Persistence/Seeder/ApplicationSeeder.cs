using CarePortal.Domain.Entities;
using CarePortal.Persistence.Context;
using CarePortal.Shared.Constants;
using CarePortal.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CarePortal.Persistence.Data;

public static class ApplicationSeeder
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

        // Ensure database is created
        await context.Database.EnsureCreatedAsync();

        // Seed roles based on UserRole enum
        await SeedRolesAsync(roleManager);

        // Seed admin user
        await SeedAdminUserAsync(userManager);
    }

    private static async Task SeedRolesAsync(RoleManager<ApplicationRole> roleManager)
    {
        // Get all UserRole enum values
        var userRoles = Enum.GetValues<UserRole>();

        foreach (var userRole in userRoles)
        {
            var roleName = userRole.GetRoleName();
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var role = new ApplicationRole
                {
                    Name = roleName,
                    Description = $"{userRole.GetDisplayName()} role for CarePortal",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                await roleManager.CreateAsync(role);
            }
        }
    }

    private static async Task SeedAdminUserAsync(UserManager<ApplicationUser> userManager)
    {
        var adminEmail = "admin@careportal.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FirstName = "Admin",
                LastName = "User",
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                TwoFactorEnabled = false,
                LockoutEnabled = false,
                AccessFailedCount = 0,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var result = await userManager.CreateAsync(adminUser, "Admin@123");

            if (result.Succeeded)
            {
                // Check if user already has the Admin role before adding it
                var userRoles = await userManager.GetRolesAsync(adminUser);
                var adminRoleName = UserRole.Admin.GetRoleName();
                if (!userRoles.Contains(adminRoleName))
                {
                    await userManager.AddToRoleAsync(adminUser, adminRoleName);
                }
            }
        }
    }
} 