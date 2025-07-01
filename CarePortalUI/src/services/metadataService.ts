import { apiService } from './api';

export interface MetadataDto {
  paramKey: string;
  paramValue: string;
  paramValueInt: number; // Numeric enum value for automatic mapping
}

export interface MetadataListDto {
  type: string;
  metadata: MetadataDto[];
}

class MetadataService {
  private static cache: MetadataListDto[] | null = null;
  private static cacheTime: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  private isCacheValid(): boolean {
    return MetadataService.cache !== null && (Date.now() - MetadataService.cacheTime) < MetadataService.CACHE_DURATION;
  }

  async getMetadata(): Promise<MetadataListDto[]> {
    if (this.isCacheValid()) {
      return MetadataService.cache!;
    }

    const metadata = await apiService.get<MetadataListDto[]>('/Metadata/get-metadata');
    
    // Update cache
    MetadataService.cache = metadata;
    MetadataService.cacheTime = Date.now();
    
    return metadata;
  }

  async getEnumData(enumType: string): Promise<MetadataDto[]> {
    const metadata = await this.getMetadata();
    const enumData = metadata.find(item => item.type === enumType);
    return enumData?.metadata || [];
  }

  async getActivityTypes(): Promise<MetadataDto[]> {
    return await this.getEnumData('ACTIVITY_TYPE');
  }

  async getIncidentStatuses(): Promise<MetadataDto[]> {
    return await this.getEnumData('INCIDENT_STATUS');
  }

  async getIncidentSeverities(): Promise<MetadataDto[]> {
    return await this.getEnumData('INCIDENT_SEVERITY');
  }

  async getUserRoles(): Promise<MetadataDto[]> {
    return await this.getEnumData('USER_ROLE');
  }

  async getDocumentTypes(): Promise<MetadataDto[]> {
    return await this.getEnumData('DOCUMENT_TYPE');
  }

  async getDocumentStatuses(): Promise<MetadataDto[]> {
    return await this.getEnumData('DOCUMENT_STATUS');
  }

  // Method to get enum value by key (replaces static enum mapping)
  async getEnumValueByKey(enumType: string, key: string): Promise<number> {
    const metadata = await this.getMetadata();
    const enumData = metadata.find(item => item.type === enumType);
    const item = enumData?.metadata.find(m => m.paramKey === key);
    return item?.paramValueInt || 0;
  }

  // Method to get enum key by value (reverse lookup)
  async getEnumKeyByValue(enumType: string, value: number): Promise<string> {
    const metadata = await this.getMetadata();
    const enumData = metadata.find(item => item.type === enumType);
    const item = enumData?.metadata.find(m => m.paramValueInt === value);
    return item?.paramKey || '';
  }

  // Method to clear cache if needed
  clearCache(): void {
    MetadataService.cache = null;
    MetadataService.cacheTime = 0;
  }
}

export const metadataService = new MetadataService(); 