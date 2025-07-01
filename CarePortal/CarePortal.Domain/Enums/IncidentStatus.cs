namespace CarePortal.Domain.Enums;

public enum IncidentStatus : int
{
    Open = 1,
    InProgress = 2,
    Resolved = 3,
    Closed = 4,
}

public static class IncidentStatusExtensions
{
    public static string GetDisplayName(this IncidentStatus incidentStatus)
    {
        return incidentStatus switch
        {
            IncidentStatus.Open => "Open",
            IncidentStatus.InProgress => "InProgress",
            IncidentStatus.Resolved => "Resolved",
            IncidentStatus.Closed => "Closed",
            _ => incidentStatus.ToString()
        };
    }
}