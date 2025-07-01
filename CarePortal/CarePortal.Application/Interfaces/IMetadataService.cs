using CarePortal.Application.DTOs;

namespace CarePortal.Application.Interfaces;

public interface IMetadataService
{
    List<MetadataListDto> GetMetadata();
} 