import { apiService } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roleDisplayName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export class AuthService {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/Auth/login', credentials);
  }

  // Refresh token
  async refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
    return apiService.post<AuthResponse>('/Auth/refresh-token', request);
  }

  // Logout user
  async logout(): Promise<LogoutResponse> {
    return apiService.post<LogoutResponse>('/Auth/logout');
  }

  // Get current user - we'll get the user ID from the stored user data
  async getCurrentUser(): Promise<User> {
    const storedUser = localStorage.getItem('careProvider_user');
    if (!storedUser) {
      throw new Error('No user data found');
    }
    
    const user = JSON.parse(storedUser);
    return apiService.get<User>(`/User/${user.id}`);
  }

  // Change password
  async changePassword(request: { currentPassword: string; newPassword: string }): Promise<void> {
    const storedUser = localStorage.getItem('careProvider_user');
    if (!storedUser) {
      throw new Error('No user data found');
    }
    
    const user = JSON.parse(storedUser);
    return apiService.post<void>(`/User/${user.id}/change-password`, request);
  }

  // Get all users (admin only)
  async getUsers(): Promise<User[]> {
    return apiService.get<User[]>('/User');
  }

  // Get user by ID
  async getUserById(id: string): Promise<User> {
    return apiService.get<User>(`/User/${id}`);
  }

  // Create new user
  async createUser(user: { firstName: string; lastName: string; email: string; password: string; role: string; isActive: boolean }): Promise<User> {
    return apiService.post<User>('/User', user);
  }

  // Update user
  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return apiService.put<User>(`/User/${id}`, user);
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    return apiService.delete<void>(`/User/${id}`);
  }

  // Toggle user status
  async toggleUserStatus(id: string): Promise<void> {
    return apiService.post<void>(`/User/${id}/toggle-active`);
  }

  // Search users
  async searchUsers(term: string): Promise<User[]> {
    return apiService.get<User[]>(`/User?search=${encodeURIComponent(term)}`);
  }

  // Get users by role
  async getUsersByRole(role: string): Promise<User[]> {
    return apiService.get<User[]>(`/User/role/${role}`);
  }

  // Get all roles
  async getRoles(): Promise<string[]> {
    return apiService.get<string[]>('/User/roles');
  }

  // Get all staff members
  async getStaff(): Promise<User[]> {
    return apiService.get<User[]>('/User/staff');
  }
}

export const authService = new AuthService(); 