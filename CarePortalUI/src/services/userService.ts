import { apiService } from './api';

// Type definitions matching the C# DTOs
export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roleDisplayName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  fullName: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  isActive?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserListDto {
  users: UserDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDto {
  email: string;
  newPassword: string;
}

class UserService {
  private baseUrl = '/User';

  // Get all users with pagination and search
  async getAllUsers(pageNumber: number = 1, pageSize: number = 10, search?: string): Promise<UserListDto> {
    const params = new URLSearchParams({
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString(),
    });
    
    if (search) {
      params.append('search', search);
    }

    const url = `${this.baseUrl}?${params.toString()}`;
    return apiService.get<UserListDto>(url);
  }

  // Get all users (simple version for backward compatibility)
  async getUsers(): Promise<UserDto[]> {
    const response = await this.getAllUsers(1, 1000);
    return response.users;
  }

  // Search users
  async searchUsers(term: string): Promise<UserDto[]> {
    const response = await this.getAllUsers(1, 1000, term);
    return response.users;
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<UserDto[]> {
    const response = await apiService.get<UserListDto>(`${this.baseUrl}/role/${role}`);
    return response.users;
  }

  // Get all staff members
  async getStaff(): Promise<UserDto[]> {
    const response = await apiService.get<UserListDto>(`${this.baseUrl}/staff`);
    return response.users;
  }

  // Get all roles
  async getRoles(): Promise<string[]> {
    return apiService.get<string[]>(`${this.baseUrl}/roles`);
  }

  // Get user by ID
  async getUserById(id: string): Promise<UserDto> {
    return apiService.get<UserDto>(`${this.baseUrl}/${id}`);
  }

  // Create new user
  async createUser(userData: CreateUserDto): Promise<UserDto> {
    return apiService.post<UserDto>(this.baseUrl, userData);
  }

  // Update user
  async updateUser(id: string, userData: UpdateUserDto): Promise<UserDto> {
    return apiService.put<UserDto>(`${this.baseUrl}/${id}`, userData);
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Toggle user active status
  async toggleUserActiveStatus(id: string): Promise<void> {
    return apiService.post<void>(`${this.baseUrl}/${id}/toggle-active`);
  }

  // Change password
  async changePassword(id: string, passwordData: ChangePasswordDto): Promise<void> {
    return apiService.post<void>(`${this.baseUrl}/${id}/change-password`, passwordData);
  }

  // Reset password (admin only)
  async resetPassword(passwordData: ResetPasswordDto): Promise<void> {
    return apiService.post<void>(`${this.baseUrl}/reset-password`, passwordData);
  }
}

export const userService = new UserService(); 