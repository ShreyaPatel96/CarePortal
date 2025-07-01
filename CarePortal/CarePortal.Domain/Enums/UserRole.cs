namespace CarePortal.Domain.Enums;

public enum UserRole : int
{
    Staff = 1,
    Admin = 2,
}

public static class UserRoleExtensions
{
    public static string GetDisplayName(this UserRole userRole)
    {
        return userRole switch
        {
            UserRole.Staff => "Staff",
            UserRole.Admin => "Admin",
            _ => userRole.ToString()
        };
    }

    public static string GetRoleName(this UserRole userRole)
    {
        return userRole switch
        {
            UserRole.Staff => "Staff",
            UserRole.Admin => "Admin",
            _ => userRole.ToString()
        };
    }
} 