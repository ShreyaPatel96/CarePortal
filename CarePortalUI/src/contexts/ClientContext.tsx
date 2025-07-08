import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { clientService, ClientDto, CreateClientDto, UpdateClientDto } from '../services/clientService';
import { ErrorHandler } from '../utils/errorHandler';
import { IClientContext } from './interfaces/IClientContext';

interface ClientProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const ClientContext = createContext<IClientContext | undefined>(undefined);

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};

// Helper function to handle API errors
const handleApiError = (error: any, operation: string): string => {
  return ErrorHandler.extractErrorMessage(error, operation);
};

export const ClientProvider: React.FC<ClientProviderProps> = ({ children, isAuthenticated }) => {
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    loading: false,
    operation: false
  });

  const clientsLoadingRef = useRef(false);

  // Load initial data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshClients();
    } else {
      setClients([]);
      setError(null);
    }
  }, [isAuthenticated]);

  // Client operations with optimistic updates
  const refreshClients = useCallback(async () => {
    if (clientsLoadingRef.current) {
      return;
    }
    
    clientsLoadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await clientService.getAllClients(1, 100); 
      setClients(response.clients);
    } catch (err) {
      const errorMessage = handleApiError(err, 'clients');
      console.error('❌ ClientContext - Failed to load clients:', err);
      setError(errorMessage);
    } finally {
      clientsLoadingRef.current = false;
      setLoadingStates(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const addClient = async (client: CreateClientDto) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      const tempClient: ClientDto = {
        id: Date.now(), // Temporary ID
        firstName: client.firstName,
        lastName: client.lastName,
        fullName: `${client.firstName} ${client.lastName}`,
        dateOfBirth: client.dateOfBirth,
        address: client.address,
        phoneNumber: client.phoneNumber,
        email: client.email,
        assignedStaffId: client.assignedStaffId,
        isActive: client.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedStaffName: 'Loading...',
      };
      
      setClients(prev => [tempClient, ...prev]);
      
      const newClient = await clientService.createClient(client);
      
      setClients(prev => prev.map(c => c.id === tempClient.id ? newClient : c));
    } catch (err) {
      setClients(prev => prev.filter(c => c.id !== Date.now()));
      
      const errorMessage = handleApiError(err, 'add client');
      setError(errorMessage);
      console.error('❌ ClientContext - Failed to add client:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const updateClient = async (id: number, client: UpdateClientDto) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      setClients(prev => prev.map(c => 
        c.id === id 
          ? { ...c, ...client, updatedAt: new Date().toISOString() }
          : c
      ));
      
      await clientService.updateClient(id, client);
    } catch (err) {
      // Revert optimistic update on error
      await refreshClients();
      
      const errorMessage = handleApiError(err, 'update client');
      setError(errorMessage);
      console.error('❌ ClientContext - Failed to update client:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const deleteClient = async (id: number) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    const clientToDelete = clients.find(c => c.id === id);
    
    try {
      setClients(prev => prev.filter(c => c.id !== id));
      
      await clientService.deleteClient(id);
    } catch (err) {
      if (clientToDelete) {
        setClients(prev => [...prev, clientToDelete]);
      }
      
      const errorMessage = handleApiError(err, 'delete client');
      setError(errorMessage);
      console.error('❌ ClientContext - Failed to delete client:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: IClientContext = {
    clients,
    loading: loadingStates.loading || loadingStates.operation,
    error,
    addClient,
    updateClient,
    deleteClient,
    refreshClients,
    clearError,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}; 