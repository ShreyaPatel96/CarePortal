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
}

export const authService = new AuthService(); 