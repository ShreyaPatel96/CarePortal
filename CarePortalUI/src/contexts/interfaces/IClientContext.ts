import { ClientDto, CreateClientDto, UpdateClientDto } from '../../services/clientService';

export interface IClientContext {
  clients: ClientDto[];
  loading: boolean;
  error: string | null;
  
  // Client operations
  addClient: (client: CreateClientDto) => Promise<void>;
  updateClient: (id: number, client: UpdateClientDto) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  refreshClients: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
} 