namespace CarePortal.Application.DTOs;

public class MetadataDto
{
    public string ParamKey { get; set; } = string.Empty;
    public string ParamValue { get; set; } = string.Empty;
    public int ParamValueInt { get; set; } = 0; // Numeric enum value for automatic mapping
}

public class MetadataListDto
{
    public string Type { get; set; } = string.Empty;
    public List<MetadataDto> Metadata { get; set; } = new();
} 