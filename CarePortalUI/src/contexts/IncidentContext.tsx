import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { incidentService, Incident, CreateIncidentDto, UpdateIncidentDto } from '../services/incidentService';
import { ErrorHandler } from '../utils/errorHandler';
import { IIncidentContext } from './interfaces/IIncidentContext';

interface IncidentProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const IncidentContext = createContext<IIncidentContext | undefined>(undefined);

export const useIncident = () => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncident must be used within an IncidentProvider');
  }
  return context;
};

// Helper function to handle API errors
const handleApiError = (error: any, operation: string): string => {
  return ErrorHandler.extractErrorMessage(error, operation);
};

export const IncidentProvider: React.FC<IncidentProviderProps> = ({ children, isAuthenticated }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    loading: false,
    operation: false
  });

  const incidentsLoadingRef = useRef(false);

  // Load initial data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshIncidents();
    } else {
      setIncidents([]);
      setError(null);
    }
  }, [isAuthenticated]);

  // Incident operations with optimistic updates
  const refreshIncidents = useCallback(async () => {
    if (incidentsLoadingRef.current) {
      return;
    }
    
    incidentsLoadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await incidentService.getAll(1, 100);
      setIncidents(response.incidents);
    } catch (err) {
      const errorMessage = handleApiError(err, 'incidents');
      console.error('❌ IncidentContext - Failed to load incidents:', err);
      setError(errorMessage);
    } finally {
      incidentsLoadingRef.current = false;
      setLoadingStates(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const addIncident = async (incident: CreateIncidentDto) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      const tempIncident: Incident = {
        id: Date.now(), // Temporary ID
        clientId: incident.clientId,
        staffId: incident.staffId,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        status: incident.status || 1, // Default to Open
        incidentDate: incident.incidentDate,
        incidentTime: incident.incidentTime,
        location: incident.location,
        fileName: incident.fileName,
        isActive: incident.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clientName: 'Loading...',
        staffName: 'Loading...',
      };
      
      setIncidents(prev => [tempIncident, ...prev]);
      
      const newIncident = await incidentService.create(incident);
      
      setIncidents(prev => prev.map(i => i.id === tempIncident.id ? newIncident : i));
    } catch (err) {
      setIncidents(prev => prev.filter(i => i.id !== Date.now()));
      
      const errorMessage = handleApiError(err, 'add incident');
      setError(errorMessage);
      console.error('❌ IncidentContext - Failed to add incident:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const updateIncident = async (id: number, incident: UpdateIncidentDto) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      setIncidents(prev => prev.map(i => 
        i.id === id 
          ? { ...i, ...incident, updatedAt: new Date().toISOString() }
          : i
      ));
      
      await incidentService.update(id, incident);
    } catch (err) {
      // Revert optimistic update on error
      await refreshIncidents();
      
      const errorMessage = handleApiError(err, 'update incident');
      setError(errorMessage);
      console.error('❌ IncidentContext - Failed to update incident:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const deleteIncident = async (id: number) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    const incidentToDelete = incidents.find(i => i.id === id);
    
    try {
      setIncidents(prev => prev.filter(i => i.id !== id));
      
      await incidentService.delete(id);
    } catch (err) {
      if (incidentToDelete) {
        setIncidents(prev => [...prev, incidentToDelete]);
      }
      
      const errorMessage = handleApiError(err, 'delete incident');
      setError(errorMessage);
      console.error('❌ IncidentContext - Failed to delete incident:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: IIncidentContext = {
    incidents,
    loading: loadingStates.loading || loadingStates.operation,
    error,
    addIncident,
    updateIncident,
    deleteIncident,
    refreshIncidents,
    clearError,
  };

  return (
    <IncidentContext.Provider value={value}>
      {children}
    </IncidentContext.Provider>
  );
}; 