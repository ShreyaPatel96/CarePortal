using CarePortal.Application.DTOs;
using CarePortal.Application.Interfaces;
using CarePortal.Domain.Enums;

namespace CarePortal.Application.Services;

public class MetadataService : IMetadataService
{
    private static readonly object _lock = new object();
    private static List<MetadataListDto>? _cachedMetadata;
    private static DateTime _lastCacheTime = DateTime.MinValue;
    private static readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(5); // Cache for 5 minutes

    public List<MetadataListDto> GetMetadata()
    {
        lock (_lock)
        {
            // Check if cache is still valid
            if (_cachedMetadata != null && DateTime.UtcNow - _lastCacheTime < _cacheExpiration)
            {
                return _cachedMetadata;
            }

            // Generate new metadata
            var metadataList = new List<MetadataListDto>();
            
            // Add ActivityType enum
            metadataList.Add(CreateMetadataListDto("ACTIVITY_TYPE", typeof(ActivityType)));
            
            // Add IncidentStatus enum
            metadataList.Add(CreateMetadataListDto("INCIDENT_STATUS", typeof(IncidentStatus)));
            
            // Add IncidentSeverity enum
            metadataList.Add(CreateMetadataListDto("INCIDENT_SEVERITY", typeof(IncidentSeverity)));
            
            // Add UserRole enum
            metadataList.Add(CreateMetadataListDto("USER_ROLE", typeof(UserRole)));
            
            // Add DocumentType enum
            metadataList.Add(CreateMetadataListDto("DOCUMENT_TYPE", typeof(DocumentType)));
            
            // Add DocumentStatus enum
            metadataList.Add(CreateMetadataListDto("DOCUMENT_STATUS", typeof(DocumentStatus)));
            
            // Update cache
            _cachedMetadata = metadataList;
            _lastCacheTime = DateTime.UtcNow;
            
            return metadataList;
        }
    }
    
    private MetadataListDto CreateMetadataListDto(string type, Type enumType)
    {
        var metadata = Enum.GetValues(enumType)
            .Cast<Enum>()
            .Select(value => new MetadataDto
            {
                ParamKey = value.ToString(),
                ParamValue = GetDisplayName(value),
                ParamValueInt = Convert.ToInt32(value) // Add the numeric value
            })
            .ToList();
            
        return new MetadataListDto
        {
            Type = type,
            Metadata = metadata
        };
    }
    
    private string GetDisplayName(Enum value)
    {
        return value switch
        {
            ActivityType activityType => activityType.GetDisplayName(),
            IncidentStatus status => status.GetDisplayName(),
            IncidentSeverity severity => severity.GetDisplayName(),
            UserRole userRole => userRole.GetDisplayName(),
            DocumentType documentType => documentType.GetDisplayName(),
            DocumentStatus documentStatus => documentStatus.GetDisplayName(),
            _ => value.ToString()
        };
    }
} 