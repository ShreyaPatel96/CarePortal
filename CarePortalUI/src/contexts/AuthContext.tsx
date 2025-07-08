import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, LoginRequest } from '../services/authService';
import { IAuthContext, AuthUser } from './interfaces/IAuthContext';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to handle API errors
const handleAuthError = (error: any, operation: string): string => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.title || 'Unknown error';
    
    switch (status) {
      case 401:
        return 'Invalid credentials. Please check your email and password.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return `The requested ${operation} was not found.`;
      case 409:
        return `This ${operation} already exists or conflicts with existing data.`;
      case 422:
        return `Invalid data provided for ${operation}. Please check your input.`;
      case 500:
        return 'Server error occurred. Please try again later.';
      default:
        return `Error ${status}: ${message}`;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection and try again.';
  } else {
    // Other error
    return `Error: ${error.message || 'An unexpected error occurred.'}`;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('careProvider_token');
      if (token) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser as AuthUser);
        } catch (error) {
          const errorMessage = handleAuthError(error, 'user');
          console.error('Failed to get current user:', error);
          setError(errorMessage);
          // Clear invalid tokens
          localStorage.removeItem('careProvider_token');
          localStorage.removeItem('careProvider_user');
          localStorage.removeItem('careProvider_refreshToken');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setError(null);
    try {
      const loginRequest: LoginRequest = { email, password };
      const response = await authService.login(loginRequest);
      
      if (response.success) {
        // Store token, refresh token, and user data
        localStorage.setItem('careProvider_token', response.data.token);
        localStorage.setItem('careProvider_refreshToken', response.data.refreshToken);
        localStorage.setItem('careProvider_user', JSON.stringify(response.data.user));
        
        setUser(response.data.user as AuthUser);
        return { success: true };
      } else {
        const errorMessage = response.message || 'Login failed. Please try again.';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error: any) {
      const errorMessage = handleAuthError(error, 'login');
      console.error('Login failed:', error);
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    try {
      // Call logout API to invalidate token on server
      await authService.logout();
    } catch (error) {
      const errorMessage = handleAuthError(error, 'logout');
      console.error('Logout API call failed:', error);
      setError(errorMessage);
    } finally {
      // Clear local storage and state regardless of API call result
      setUser(null);
      localStorage.removeItem('careProvider_token');
      localStorage.removeItem('careProvider_user');
      localStorage.removeItem('careProvider_refreshToken');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    loading,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};