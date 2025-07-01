namespace CarePortal.Domain.Enums;

public enum IncidentSeverity : int
{
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4,
}

public static class IncidentSeverityExtensions
{
    public static string GetDisplayName(this IncidentSeverity incidentSeverity)
    {
        return incidentSeverity switch
        {
            IncidentSeverity.Low => "Low",
            IncidentSeverity.Medium => "Medium",
            IncidentSeverity.High => "High",
            IncidentSeverity.Critical => "Critical",
            _ => incidentSeverity.ToString()
        };
    }
}