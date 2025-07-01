import { apiService } from './api';

// Type definitions matching the C# DTOs
export interface ClientDto {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  assignedStaffId?: string;
  assignedStaffName?: string;
  fullName: string;
}

export interface CreateClientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber: string;
  email: string;
  assignedStaffId?: string;
  isActive?: boolean;
}

export interface UpdateClientDto {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  assignedStaffId?: string;
  isActive?: boolean;
}

export interface ClientListDto {
  clients: ClientDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

class ClientService {
  private baseUrl = '/Client';

  // Get all clients with pagination and search
  async getAllClients(pageNumber: number = 1, pageSize: number = 10, search?: string): Promise<ClientListDto> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    return apiService.get<ClientListDto>(`${this.baseUrl}?${params.toString()}`);
  }

  // Get client by ID
  async getClientById(id: number): Promise<ClientDto> {
    return apiService.get<ClientDto>(`${this.baseUrl}/${id}`);
  }

  // Create new client
  async createClient(clientData: CreateClientDto): Promise<ClientDto> {
    return apiService.post<ClientDto>(this.baseUrl, clientData);
  }

  // Update client
  async updateClient(id: number, clientData: UpdateClientDto): Promise<ClientDto> {
    return apiService.put<ClientDto>(`${this.baseUrl}/${id}`, clientData);
  }

  // Delete client
  async deleteClient(id: number): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Toggle client active status
  async toggleClientActiveStatus(id: number): Promise<void> {
    return apiService.post<void>(`${this.baseUrl}/${id}/toggle-active`);
  }
}

export const clientService = new ClientService(); 