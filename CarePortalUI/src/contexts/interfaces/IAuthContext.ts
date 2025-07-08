export interface AuthUser {
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

export interface IAuthContext {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  clearError: () => void;
} 