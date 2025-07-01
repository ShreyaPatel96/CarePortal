import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { clientService, ClientDto, CreateClientDto, UpdateClientDto } from '../services/clientService';
import { jobTimeService, JobTime, CreateJobTimeDto, UpdateJobTimeDto } from '../services/jobTimeService';
import { incidentService, Incident, CreateIncidentDto, UpdateIncidentDto } from '../services/incidentService';
import { documentService, Document, CreateDocumentRequest, UpdateDocumentRequest } from '../services/documentService';
import { authService, User } from '../services/authService';
import { userService } from '../services/userService';
import { ErrorHandler } from '../utils/errorHandler';

interface DataContextType {
  clients: ClientDto[];
  jobTimes: JobTime[];
  incidents: Incident[];
  documents: Document[];
  documentsTotalCount: number;
  documentsPageNumber: number;
  documentsPageSize: number;
  users: User[];
  usersTotalCount: number;
  loading: boolean;
  error: string | null;
  
  // Client operations
  addClient: (client: CreateClientDto) => Promise<void>;
  updateClient: (id: number, client: UpdateClientDto) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  refreshClients: () => Promise<void>;
  
  // Job time operations
  addJobTime: (jobTime: CreateJobTimeDto) => Promise<void>;
  updateJobTime: (id: number, jobTime: UpdateJobTimeDto) => Promise<void>;
  deleteJobTime: (id: number) => Promise<void>;
  refreshJobTimes: () => Promise<void>;
  
  // Incident operations
  addIncident: (incident: CreateIncidentDto) => Promise<void>;
  updateIncident: (id: number, incident: UpdateIncidentDto) => Promise<void>;
  deleteIncident: (id: number) => Promise<void>;
  refreshIncidents: () => Promise<void>;
  
  // Document operations
  addDocument: (document: CreateDocumentRequest) => Promise<Document>;
  updateDocument: (id: number, document: UpdateDocumentRequest) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  refreshDocuments: (pageNumber?: number, pageSize?: number, clientId?: number, status?: string, search?: string) => Promise<void>;
  
  // User operations
  addUser: (user: { firstName: string; lastName: string; email: string; password: string; role: string; isActive: boolean }) => Promise<void>;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  refreshUsers: (pageNumber?: number, pageSize?: number, search?: string) => Promise<void>;
  
  // Error handling
  clearError: () => void;
}

interface DataProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Helper function to handle API errors - now using the centralized ErrorHandler
const handleApiError = (error: any, operation: string): string => {
  return ErrorHandler.extractErrorMessage(error, operation);
};

export const DataProvider: React.FC<DataProviderProps> = ({ children, isAuthenticated }) => {
  const [clients, setClients] = useState<ClientDto[]>([]);
  const [jobTimes, setJobTimes] = useState<JobTime[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsTotalCount, setDocumentsTotalCount] = useState(0);
  const [documentsPageNumber, setDocumentsPageNumber] = useState(1);
  const [documentsPageSize, setDocumentsPageSize] = useState(10);
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add loading states for individual operations to prevent multiple calls
  const [loadingStates, setLoadingStates] = useState({
    clients: { loading: false, operation: false },
    jobTimes: { loading: false, operation: false },
    incidents: { loading: false, operation: false },
    documents: { loading: false, operation: false },
    users: { loading: false, operation: false }
  });

  // Add a flag to prevent multiple simultaneous data loads
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Add refs to track loading states without causing re-renders
  const usersLoadingRef = useRef(false);
  const clientsLoadingRef = useRef(false);
  const jobTimesLoadingRef = useRef(false);
  const incidentsLoadingRef = useRef(false);
  const documentsLoadingRef = useRef(false);

  // Load initial data only when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoadingData) {
      loadAllData();
    } else if (!isAuthenticated) {
      setClients([]);
      setJobTimes([]);
      setIncidents([]);
      setDocuments([]);
      setUsers([]);
      setError(null);
    }
  }, [isAuthenticated]); // Remove isLoadingData from dependency to prevent infinite loops

  const loadAllData = async () => {
    if (isLoadingData) {
      console.log('🔄 DataContext - Already loading data, skipping...');
      return;
    }
    
    setIsLoadingData(true);
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 DataContext - Starting to load all data...');
      
      // Load data sequentially to prevent overwhelming the server
      await refreshClients();
      await refreshJobTimes();
      await refreshIncidents();
      await refreshDocuments();
      await refreshUsers();
      
      console.log('✅ DataContext - All data loaded successfully');
    } catch (err) {
      const errorMessage = handleApiError(err, 'data');
      setError(errorMessage);
      console.error('❌ DataContext - Failed to load data:', err);
    } finally {
      setLoading(false);
      setIsLoadingData(false);
    }
  };

  // Client operations with optimistic updates
  const refreshClients = useCallback(async () => {
    if (clientsLoadingRef.current) {
      console.log('🔄 DataContext - Already loading clients, skipping...');
      return;
    }
    
    clientsLoadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, clients: { ...prev.clients, loading: true } }));
    
    try {
      const response = await clientService.getAllClients(1, 100); 
      setClients(response.clients);
    } catch (err) {
      const errorMessage = handleApiError(err, 'clients');
      console.error('❌ DataContext - Failed to load clients:', err);
      throw new Error(errorMessage);
    } finally {
      clientsLoadingRef.current = false;
      setLoadingStates(prev => ({ ...prev, clients: { ...prev.clients, loading: false } }));
    }
  }, []);

  const addClient = async (client: CreateClientDto) => {
    if (loadingStates.clients.operation) {
      console.log('🔄 DataContext - Already processing client operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, clients: { ...prev.clients, operation: true } }));
    
    try {
      // Optimistic update - add temporary client with loading state
      const tempClient: ClientDto = {
        id: Date.now(), // Temporary ID
        firstName: client.firstName,
        lastName: client.lastName,
        dateOfBirth: client.dateOfBirth,
        address: client.address,
        phoneNumber: client.phoneNumber,
        email: client.email,
        assignedStaffId: client.assignedStaffId,
        isActive: client.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        assignedStaffName: 'Loading...',
        fullName: `${client.firstName} ${client.lastName}`,
      };
      
      setClients(prev => [tempClient, ...prev]);
      
      // Make API call
      const newClient = await clientService.createClient(client);
      
      // Replace temporary client with real one
      setClients(prev => prev.map(c => c.id === tempClient.id ? newClient : c));
      
    } catch (err) {
      // Revert optimistic update on error
      setClients(prev => prev.filter(c => c.id !== Date.now()));
      const errorMessage = handleApiError(err, 'client');
      console.error('Failed to add client:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, clients: { ...prev.clients, operation: false } }));
    }
  };

  const updateClient = async (id: number, client: UpdateClientDto) => {
    if (loadingStates.clients.operation) {
      console.log('🔄 DataContext - Already processing client operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, clients: { ...prev.clients, operation: true } }));
    
    try {
      // Optimistic update
      setClients(prev => prev.map(c => 
        c.id === id ? { ...c, ...client, updatedAt: new Date().toISOString() } : c
      ));
      
      // Make API call
      const updatedClient = await clientService.updateClient(id, client);
      
      // Update with server response
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      
    } catch (err) {
      // Revert optimistic update on error
      await refreshClients();
      const errorMessage = handleApiError(err, 'client');
      console.error('Failed to update client:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, clients: { ...prev.clients, operation: false } }));
    }
  };

  const deleteClient = async (id: number) => {
    if (loadingStates.clients.operation) {
      console.log('🔄 DataContext - Already processing client operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, clients: { ...prev.clients, operation: true } }));
    
    let clientToDelete: ClientDto | undefined;
    try {
      // Optimistic update
      clientToDelete = clients.find(c => c.id === id);
      setClients(prev => prev.filter(c => c.id !== id));
      
      // Make API call
      await clientService.deleteClient(id);
      
    } catch (err) {
      // Revert optimistic update on error
      if (clientToDelete) {
        setClients(prev => [...prev, clientToDelete!]);
      }
      const errorMessage = handleApiError(err, 'client');
      console.error('Failed to delete client:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, clients: { ...prev.clients, operation: false } }));
    }
  };

  // Job time operations with optimistic updates
  const refreshJobTimes = useCallback(async () => {
    if (jobTimesLoadingRef.current) {
      console.log('🔄 DataContext - Already loading job times, skipping...');
      return;
    }
    
    jobTimesLoadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, jobTimes: { ...prev.jobTimes, loading: true } }));
    
    try {
      const response = await jobTimeService.getAll(1, 100);
      setJobTimes(response.jobTimes);
    } catch (err) {
      const errorMessage = handleApiError(err, 'job times');
      console.error('❌ DataContext - Failed to load job times:', err);
      throw new Error(errorMessage);
    } finally {
      jobTimesLoadingRef.current = false;
      setLoadingStates(prev => ({ ...prev, jobTimes: { ...prev.jobTimes, loading: false } }));
    }
  }, []);

  const addJobTime = async (jobTime: CreateJobTimeDto) => {
    if (loadingStates.jobTimes.operation) {
      console.log('🔄 DataContext - Already processing job time operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, jobTimes: { ...prev.jobTimes, operation: true } }));
    
    try {
      // Optimistic update
      const tempJobTime: JobTime = {
        id: Date.now(),
        clientId: jobTime.clientId,
        staffId: jobTime.staffId,
        startTime: jobTime.startTime,
        endTime: jobTime.endTime || '',
        activityType: jobTime.activityType,
        activityTypeDisplayName: 'Loading...',
        notes: jobTime.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: jobTime.isActive ?? true,
        duration: '',
        isCompleted: false,
        clientName: 'Loading...',
        staffName: 'Loading...'
      };
      
      setJobTimes(prev => [tempJobTime, ...prev]);
      
      // Make API call
      const newJobTime = await jobTimeService.create(jobTime);
      
      // Replace temporary job time with real one
      setJobTimes(prev => prev.map(jt => jt.id === tempJobTime.id ? newJobTime : jt));
      
    } catch (err) {
      // Revert optimistic update on error
      setJobTimes(prev => prev.filter(jt => jt.id !== Date.now()));
      const errorMessage = handleApiError(err, 'job time');
      console.error('Failed to add job time:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, jobTimes: { ...prev.jobTimes, operation: false } }));
    }
  };

  const updateJobTime = async (id: number, jobTime: UpdateJobTimeDto) => {
    if (loadingStates.jobTimes.operation) {
      console.log('🔄 DataContext - Already processing job time operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, jobTimes: { ...prev.jobTimes, operation: true } }));
    
    try {
      // Optimistic update
      setJobTimes(prev => prev.map(jt => 
        jt.id === id ? { ...jt, ...jobTime, updatedAt: new Date().toISOString() } : jt
      ));
      
      // Make API call
      const updatedJobTime = await jobTimeService.update(id, jobTime);
      
      // Update with server response
      setJobTimes(prev => prev.map(jt => jt.id === id ? updatedJobTime : jt));
      
    } catch (err) {
      // Revert optimistic update on error
      await refreshJobTimes();
      const errorMessage = handleApiError(err, 'job time');
      console.error('Failed to update job time:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, jobTimes: { ...prev.jobTimes, operation: false } }));
    }
  };

  const deleteJobTime = async (id: number) => {
    if (loadingStates.jobTimes.operation) {
      console.log('🔄 DataContext - Already processing job time operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, jobTimes: { ...prev.jobTimes, operation: true } }));
    
    let jobTimeToDelete: JobTime | undefined;
    try {
      // Optimistic update
      jobTimeToDelete = jobTimes.find(jt => jt.id === id);
      setJobTimes(prev => prev.filter(jt => jt.id !== id));
      
      // Make API call
      await jobTimeService.delete(id);
      
    } catch (err) {
      // Revert optimistic update on error
      if (jobTimeToDelete) {
        setJobTimes(prev => [...prev, jobTimeToDelete!]);
      }
      const errorMessage = handleApiError(err, 'job time');
      console.error('Failed to delete job time:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, jobTimes: { ...prev.jobTimes, operation: false } }));
    }
  };

  // Incident operations with optimistic updates
  const refreshIncidents = useCallback(async () => {
    if (incidentsLoadingRef.current) {
      console.log('🔄 DataContext - Already loading incidents, skipping...');
      return;
    }
    
    incidentsLoadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, incidents: { ...prev.incidents, loading: true } }));
    
    try {
      const response = await incidentService.getAll(1, 100);
      setIncidents(response.incidents);
    } catch (err) {
      const errorMessage = handleApiError(err, 'incidents');
      console.error('❌ DataContext - Failed to load incidents:', err);
      throw new Error(errorMessage);
    } finally {
      incidentsLoadingRef.current = false;
      setLoadingStates(prev => ({ ...prev, incidents: { ...prev.incidents, loading: false } }));
    }
  }, []);

  const addIncident = async (incident: CreateIncidentDto) => {
    if (loadingStates.incidents.operation) {
      console.log('🔄 DataContext - Already processing incident operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, incidents: { ...prev.incidents, operation: true } }));
    
    try {
      // Optimistic update
      const tempIncident: Incident = {
        id: Date.now(),
        clientId: incident.clientId,
        staffId: incident.staffId,
        title: incident.title,
        description: incident.description,
        incidentDate: incident.incidentDate,
        incidentTime: incident.incidentTime,
        location: incident.location,
        fileName: incident.fileName,
        isActive: incident.isActive ?? true,
        status: incident.status ?? 1,
        severity: incident.severity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clientName: 'Loading...',
        staffName: 'Loading...'
      };
      
      setIncidents(prev => [tempIncident, ...prev]);
      
      // Make API call
      const newIncident = await incidentService.create(incident);
      
      // Replace temporary incident with real one
      setIncidents(prev => prev.map(i => i.id === tempIncident.id ? newIncident : i));
      
    } catch (err) {
      // Revert optimistic update on error
      setIncidents(prev => prev.filter(i => i.id !== Date.now()));
      const errorMessage = handleApiError(err, 'incident');
      console.error('Failed to add incident:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, incidents: { ...prev.incidents, operation: false } }));
    }
  };

  const updateIncident = async (id: number, incident: UpdateIncidentDto) => {
    if (loadingStates.incidents.operation) {
      console.log('🔄 DataContext - Already processing incident operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, incidents: { ...prev.incidents, operation: true } }));
    
    try {
      // Optimistic update
      setIncidents(prev => prev.map(i => 
        i.id === id ? { ...i, ...incident, updatedAt: new Date().toISOString() } : i
      ));
      
      // Make API call
      const updatedIncident = await incidentService.update(id, incident);
      
      // Update with server response
      setIncidents(prev => prev.map(i => i.id === id ? updatedIncident : i));
      
    } catch (err) {
      // Revert optimistic update on error
      await refreshIncidents();
      const errorMessage = handleApiError(err, 'incident');
      console.error('Failed to update incident:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, incidents: { ...prev.incidents, operation: false } }));
    }
  };

  const deleteIncident = async (id: number) => {
    if (loadingStates.incidents.operation) {
      console.log('🔄 DataContext - Already processing incident operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, incidents: { ...prev.incidents, operation: true } }));
    
    let incidentToDelete: Incident | undefined;
    try {
      // Optimistic update
      incidentToDelete = incidents.find(i => i.id === id);
      setIncidents(prev => prev.filter(i => i.id !== id));
      
      // Make API call
      await incidentService.delete(id);
      
    } catch (err) {
      // Revert optimistic update on error
      if (incidentToDelete) {
        setIncidents(prev => [...prev, incidentToDelete!]);
      }
      const errorMessage = handleApiError(err, 'incident');
      console.error('Failed to delete incident:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, incidents: { ...prev.incidents, operation: false } }));
    }
  };

  // Document operations with optimistic updates
  const refreshDocuments = useCallback(async (pageNumber?: number, pageSize?: number, clientId?: number, status?: string, search?: string) => {
    if (documentsLoadingRef.current) {
      console.log('🔄 DataContext - Already loading documents, skipping...');
      return;
    }
    
    documentsLoadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, documents: { ...prev.documents, loading: true } }));
    
    try {
      const response = await documentService.getDocuments(pageNumber || 1, pageSize || 10, clientId, status, search);
      setDocuments(response.documents);
      setDocumentsTotalCount(response.totalCount);
      setDocumentsPageNumber(pageNumber || 1);
      setDocumentsPageSize(pageSize || 10);
    } catch (err) {
      const errorMessage = handleApiError(err, 'documents');
      console.error('❌ DataContext - Failed to load documents:', err);
      throw new Error(errorMessage);
    } finally {
      documentsLoadingRef.current = false;
      setLoadingStates(prev => ({ ...prev, documents: { ...prev.documents, loading: false } }));
    }
  }, []);

  const addDocument = async (document: CreateDocumentRequest): Promise<Document> => {
    if (loadingStates.documents.operation) {
      console.log('🔄 DataContext - Already processing document operation, skipping...');
      throw new Error('Already processing document operation');
    }
    
    setLoadingStates(prev => ({ ...prev, documents: { ...prev.documents, operation: true } }));
    
    try {
      // Optimistic update
      const tempDocument: Document = {
        id: Date.now(),
        clientId: document.clientId,
        title: document.title,
        description: document.description,
        fileName: '',
        fileType: '',
        uploadedBy: '',
        deadline: document.deadline,
        status: 'pending',
        createdAt: new Date().toISOString(),
        isActive: document.isActive ?? true,
        clientName: 'Loading...'
      };
      
      setDocuments(prev => [tempDocument, ...prev]);
      
      // Make API call
      const newDocument = await documentService.createDocument(document);
      
      // Replace temporary document with real one
      setDocuments(prev => prev.map(d => d.id === tempDocument.id ? newDocument : d));
      
      return newDocument;
    } catch (err) {
      // Revert optimistic update on error
      setDocuments(prev => prev.filter(d => d.id !== Date.now()));
      const errorMessage = handleApiError(err, 'document');
      console.error('Failed to add document:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, documents: { ...prev.documents, operation: false } }));
    }
  };

  const updateDocument = async (id: number, document: UpdateDocumentRequest) => {
    if (loadingStates.documents.operation) {
      console.log('🔄 DataContext - Already processing document operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, documents: { ...prev.documents, operation: true } }));
    
    try {
      // Optimistic update
      setDocuments(prev => prev.map(d => 
        d.id === id ? { ...d, ...document, updatedAt: new Date().toISOString() } : d
      ));
      
      // Make API call
      const updatedDocument = await documentService.updateDocument(id, document);
      
      // Update with server response
      setDocuments(prev => prev.map(d => d.id === id ? updatedDocument : d));
      
    } catch (err) {
      // Revert optimistic update on error
      await refreshDocuments();
      const errorMessage = handleApiError(err, 'document');
      console.error('Failed to update document:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, documents: { ...prev.documents, operation: false } }));
    }
  };

  const deleteDocument = async (id: number) => {
    if (loadingStates.documents.operation) {
      console.log('🔄 DataContext - Already processing document operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, documents: { ...prev.documents, operation: true } }));
    
    let documentToDelete: Document | undefined;
    try {
      // Optimistic update
      documentToDelete = documents.find(d => d.id === id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      
      // Make API call
      await documentService.deleteDocument(id);
      
    } catch (err) {
      // Revert optimistic update on error
      if (documentToDelete) {
        setDocuments(prev => [...prev, documentToDelete!]);
      }
      const errorMessage = handleApiError(err, 'document');
      console.error('Failed to delete document:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, documents: { ...prev.documents, operation: false } }));
    }
  };

  // User operations with optimistic updates
  const refreshUsers = useCallback(async (pageNumber: number = 1, pageSize: number = 1000, search?: string) => {
    if (usersLoadingRef.current) {
      console.log('🔄 DataContext - Already loading users, skipping...');
      return;
    }
    
    usersLoadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, users: { ...prev.users, loading: true } }));
    
    try {
      const token = localStorage.getItem('careProvider_token');
      if (!token) {
        return;
      }
      
      const data = await userService.getAllUsers(pageNumber, pageSize, search);
      // Map UserDto to User type and extract users array and total count from paginated response
      const mappedUsers: User[] = data.users.map(userDto => ({
        id: userDto.id,
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        email: userDto.email,
        role: userDto.role,
        roleDisplayName: userDto.roleDisplayName,
        isActive: userDto.isActive,
        createdAt: userDto.createdAt,
        lastLoginAt: userDto.lastLoginAt || '',
        fullName: userDto.fullName
      }));
      setUsers(mappedUsers);
      setUsersTotalCount(data.totalCount);
    } catch (err) {
      const errorMessage = handleApiError(err, 'users');
      console.error('❌ DataContext - Failed to load users:', err);
      throw new Error(errorMessage);
    } finally {
      usersLoadingRef.current = false;
      setLoadingStates(prev => ({ ...prev, users: { ...prev.users, loading: false } }));
    }
  }, []);

  const addUser = async (user: { firstName: string; lastName: string; email: string; password: string; role: string; isActive: boolean }) => {
    if (loadingStates.users.operation) {
      console.log('🔄 DataContext - Already processing user operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, users: { ...prev.users, operation: true } }));
    
    try {
      // Optimistic update
      const tempUser: User = {
        id: Date.now().toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        roleDisplayName: user.role,
        isActive: user.isActive,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        fullName: `${user.firstName} ${user.lastName}`
      };
      
      setUsers(prev => [tempUser, ...prev]);
      
      // Make API call
      const newUser = await authService.createUser(user);
      
      // Replace temporary user with real one
      setUsers(prev => prev.map(u => u.id === tempUser.id ? newUser : u));
      
    } catch (err) {
      // Revert optimistic update on error
      setUsers(prev => prev.filter(u => u.id !== Date.now().toString()));
      const errorMessage = handleApiError(err, 'user');
      console.error('Failed to add user:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, users: { ...prev.users, operation: false } }));
    }
  };

  const updateUser = async (id: string, user: Partial<User>) => {
    if (loadingStates.users.operation) {
      console.log('🔄 DataContext - Already processing user operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, users: { ...prev.users, operation: true } }));
    
    try {
      // Optimistic update
      setUsers(prev => prev.map(u => 
        u.id === id ? { ...u, ...user } : u
      ));
      
      // Make API call
      const updatedUser = await authService.updateUser(id, user);
      
      // Update with server response
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      
    } catch (err) {
      // Revert optimistic update on error
      await refreshUsers();
      const errorMessage = handleApiError(err, 'user');
      console.error('Failed to update user:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, users: { ...prev.users, operation: false } }));
    }
  };

  const deleteUser = async (id: string) => {
    if (loadingStates.users.operation) {
      console.log('🔄 DataContext - Already processing user operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, users: { ...prev.users, operation: true } }));
    
    let userToDelete: User | undefined;
    try {
      // Optimistic update
      userToDelete = users.find(u => u.id === id);
      setUsers(prev => prev.filter(u => u.id !== id));
      
      // Make API call
      await authService.deleteUser(id);
      
    } catch (err) {
      // Revert optimistic update on error
      if (userToDelete) {
        setUsers(prev => [...prev, userToDelete!]);
      }
      const errorMessage = handleApiError(err, 'user');
      console.error('Failed to delete user:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, users: { ...prev.users, operation: false } }));
    }
  };

  const toggleUserStatus = async (id: string) => {
    if (loadingStates.users.operation) {
      console.log('🔄 DataContext - Already processing user operation, skipping...');
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, users: { ...prev.users, operation: true } }));
    
    let originalUser: User | undefined;
    try {
      // Optimistic update
      originalUser = users.find(u => u.id === id);
      if (originalUser) {
        setUsers(prev => prev.map(u => 
          u.id === id ? { ...u, isActive: !u.isActive } : u
        ));
      }
      
      // Make API call
      await userService.toggleUserActiveStatus(id);
      
    } catch (err) {
      // Revert optimistic update on error
      if (originalUser) {
        setUsers(prev => prev.map(u => u.id === id ? originalUser! : u));
      }
      const errorMessage = handleApiError(err, 'user status');
      console.error('Failed to toggle user status:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, users: { ...prev.users, operation: false } }));
    }
  };

  // Error handling
  const clearError = () => {
    setError(null);
  };

  const value = {
    clients,
    jobTimes,
    incidents,
    documents,
    documentsTotalCount,
    documentsPageNumber,
    documentsPageSize,
    users,
    usersTotalCount,
    loading,
    error,
    addClient,
    updateClient,
    deleteClient,
    refreshClients,
    addJobTime,
    updateJobTime,
    deleteJobTime,
    refreshJobTimes,
    addIncident,
    updateIncident,
    deleteIncident,
    refreshIncidents,
    addDocument,
    updateDocument,
    deleteDocument,
    refreshDocuments,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refreshUsers,
    clearError
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};