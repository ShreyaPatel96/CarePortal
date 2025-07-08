import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { userService, UserDto, CreateUserDto, UpdateUserDto } from '../services/userService';
import { ErrorHandler } from '../utils/errorHandler';
import { IUserContext } from './interfaces/IUserContext';

interface UserProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const UserContext = createContext<IUserContext | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Helper function to handle API errors
const handleApiError = (error: any, operation: string): string => {
  return ErrorHandler.extractErrorMessage(error, operation);
};

export const UserProvider: React.FC<UserProviderProps> = ({ children, isAuthenticated }) => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    loading: false,
    operation: false
  });

  const usersLoadingRef = useRef(false);

  // Load initial data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshUsers();
    } else {
      setUsers([]);
      setUsersTotalCount(0);
      setError(null);
    }
  }, [isAuthenticated]);

  // User operations with optimistic updates
  const refreshUsers = useCallback(async (search?: string) => {
    if (usersLoadingRef.current) {
      return;
    }
    
    usersLoadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, loading: true }));
    
    try {
      let users: UserDto[];
      
      if (search && search.trim()) {
        // Use search functionality
        users = await userService.searchUsers(search);
      } else {
        // Get all users
        users = await userService.getUsers();
      }
      
      setUsers(users);
      setUsersTotalCount(users.length);
    } catch (err) {
      const errorMessage = handleApiError(err, 'users');
      console.error('❌ UserContext - Failed to load users:', err);
      setError(errorMessage);
    } finally {
      usersLoadingRef.current = false;
      setLoadingStates(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const addUser = async (user: CreateUserDto) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      const newUser = await userService.createUser(user);
      
      setUsers(prev => [newUser, ...prev]);
      setUsersTotalCount(prev => prev + 1);
    } catch (err) {
      const errorMessage = handleApiError(err, 'add user');
      setError(errorMessage);
      console.error('❌ UserContext - Failed to add user:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const updateUser = async (id: string, user: UpdateUserDto) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      setUsers(prev => prev.map(u => 
        u.id === id 
          ? { ...u, ...user, updatedAt: new Date().toISOString() }
          : u
      ));
      
      await userService.updateUser(id, user);
    } catch (err) {
      await refreshUsers();
      
      const errorMessage = handleApiError(err, 'update user');
      setError(errorMessage);
      console.error('❌ UserContext - Failed to update user:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const deleteUser = async (id: string) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    const userToDelete = users.find(u => u.id === id);
    
    try {
      setUsers(prev => prev.filter(u => u.id !== id));
      setUsersTotalCount(prev => prev - 1);
      
      await userService.deleteUser(id);
    } catch (err) {
      if (userToDelete) {
        setUsers(prev => [...prev, userToDelete]);
        setUsersTotalCount(prev => prev + 1);
      }
      
      const errorMessage = handleApiError(err, 'delete user');
      setError(errorMessage);
      console.error('❌ UserContext - Failed to delete user:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const toggleUserStatus = async (id: string) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      setUsers(prev => prev.map(u => 
        u.id === id 
          ? { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString() }
          : u
      ));
      
      await userService.toggleUserActiveStatus(id);
    } catch (err) {
      // Revert optimistic update on error
      await refreshUsers();
      
      const errorMessage = handleApiError(err, 'toggle user status');
      setError(errorMessage);
      console.error('❌ UserContext - Failed to toggle user status:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: IUserContext = {
    users,
    usersTotalCount,
    loading: loadingStates.loading || loadingStates.operation,
    error,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    refreshUsers,
    clearError,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 