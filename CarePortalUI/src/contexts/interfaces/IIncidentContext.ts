import { Incident, CreateIncidentDto, UpdateIncidentDto } from '../../services/incidentService';

export interface IIncidentContext {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  
  // Incident operations
  addIncident: (incident: CreateIncidentDto) => Promise<void>;
  updateIncident: (id: number, incident: UpdateIncidentDto) => Promise<void>;
  deleteIncident: (id: number) => Promise<void>;
  refreshIncidents: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
} 