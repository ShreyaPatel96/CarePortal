import { useState, useEffect } from 'react';
import { metadataService, MetadataDto } from '../services/metadataService';

export interface UseEnumMappingOptions {
  enumType: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseEnumMappingReturn {
  enumData: MetadataDto[];
  loading: boolean;
  error: string | null;
  getEnumValue: (key: string) => number;
  getEnumKey: (value: number) => string;
  refresh: () => Promise<void>;
}

export const useEnumMapping = (options: UseEnumMappingOptions): UseEnumMappingReturn => {
  const { enumType, autoRefresh = false, refreshInterval = 300000 } = options; // 5 minutes default
  
  const [enumData, setEnumData] = useState<MetadataDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnumData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: MetadataDto[] = [];
      
      switch (enumType) {
        case 'ACTIVITY_TYPE':
          data = await metadataService.getActivityTypes();
          break;
        case 'INCIDENT_STATUS':
          data = await metadataService.getIncidentStatuses();
          break;
        case 'INCIDENT_SEVERITY':
          data = await metadataService.getIncidentSeverities();
          break;
        case 'USER_ROLE':
          data = await metadataService.getUserRoles();
          break;
        case 'DOCUMENT_TYPE':
          data = await metadataService.getDocumentTypes();
          break;
        case 'DOCUMENT_STATUS':
          data = await metadataService.getDocumentStatuses();
          break;
        default:
          // For custom enum types, get from metadata
          const metadata = await metadataService.getMetadata();
          const enumData = metadata.find(item => item.type === enumType);
          data = enumData?.metadata || [];
      }
      
      setEnumData(data);
    } catch (err) {
      console.error(`❌ useEnumMapping - Failed to fetch ${enumType}:`, err);
      setError(`Failed to load ${enumType} data`);
    } finally {
      setLoading(false);
    }
  };

  const getEnumValue = (key: string): number => {
    const item = enumData.find(m => m.paramKey === key);
    return item?.paramValueInt || 0;
  };

  const getEnumKey = (value: number): string => {
    const item = enumData.find(m => m.paramValueInt === value);
    return item?.paramKey || '';
  };

  const refresh = async () => {
    await fetchEnumData();
  };

  useEffect(() => {
    fetchEnumData();
  }, [enumType]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchEnumData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, enumType]);

  return {
    enumData,
    loading,
    error,
    getEnumValue,
    getEnumKey,
    refresh
  };
}; 