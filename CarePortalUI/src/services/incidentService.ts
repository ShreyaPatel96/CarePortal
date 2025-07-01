import { apiService } from './api';

export interface Incident {
  id: number;
  clientId: number;
  clientName: string;
  staffId: string;
  staffName: string;
  title: string;
  description: string;
  incidentDate: string; // DateTime from backend
  incidentTime: string; // TimeSpan from backend
  location: string;
  fileName?: string;
  isActive: boolean;
  status: number; // 1=Open, 2=InProgress, 3=Resolved, 4=Closed
  severity: number; // 1=Low, 2=Medium, 3=High, 4=Critical
  createdAt: string;
  updatedAt?: string;
}

export interface CreateIncidentDto {
  clientId: number;
  staffId: string;
  title: string;
  description: string;
  severity: number; // 1=Low, 2=Medium, 3=High, 4=Critical
  status?: number; // 1=Open, 2=InProgress, 3=Resolved, 4=Closed
  incidentDate: string;
  incidentTime: string;
  fileName?: string;
  location: string;
  isActive?: boolean;
}

export interface UpdateIncidentDto {
  title?: string;
  description?: string;
  severity?: number; // 1=Low, 2=Medium, 3=High, 4=Critical
  status?: number; // 1=Open, 2=InProgress, 3=Resolved, 4=Closed
  incidentDate?: string;
  incidentTime?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
  fileName?: string;
  location?: string;
  isActive?: boolean;
}

export interface IncidentListResponse {
  incidents: Incident[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ResolveIncidentRequest {
  resolvedBy: string;
  resolutionNotes: string;
}

export class IncidentService {
  // Get all incidents with pagination and filtering
  async getAll(pageNumber: number = 1, pageSize: number = 10, status?: number, severity?: number): Promise<IncidentListResponse> {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (status) params.append('status', status.toString());
    if (severity) params.append('severity', severity.toString());
    
    return apiService.get<IncidentListResponse>(`/Incident?${params.toString()}`);
  }

  // Get incident by ID
  async getById(id: number): Promise<Incident> {
    return apiService.get<Incident>(`/Incident/${id}`);
  }

  // Create new incident
  async create(incident: CreateIncidentDto): Promise<Incident> {
    return apiService.post<Incident>('/Incident', incident);
  }

  // Update incident
  async update(id: number, incident: UpdateIncidentDto): Promise<Incident> {
    return apiService.put<Incident>(`/Incident/${id}`, incident);
  }

  // Delete incident
  async delete(id: number): Promise<void> {
    return apiService.delete<void>(`/Incident/${id}`);
  }

  // Legacy methods for backward compatibility
  async getIncidents(pageNumber: number = 1, pageSize: number = 10, status?: number, severity?: number): Promise<IncidentListResponse> {
    return this.getAll(pageNumber, pageSize, status, severity);
  }

  async getIncidentById(id: number): Promise<Incident> {
    return this.getById(id);
  }

  async createIncident(incident: CreateIncidentDto): Promise<Incident> {
    return this.create(incident);
  }

  async updateIncident(id: number, incident: UpdateIncidentDto): Promise<Incident> {
    return this.update(id, incident);
  }

  async deleteIncident(id: number): Promise<void> {
    return this.delete(id);
  }
}

export const incidentService = new IncidentService(); 