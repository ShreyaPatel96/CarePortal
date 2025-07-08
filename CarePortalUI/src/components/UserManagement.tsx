import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Lock,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { UserDto, CreateUserDto, UpdateUserDto, ChangePasswordDto } from '../services/userService';
import { userService } from '../services/userService';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { useEnumMapping } from '../hooks/useEnumMapping';
import { useToast } from '../hooks/useToast';

const UserManagement: React.FC = () => {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    loading, 
    error, 
    clearError, 
    toggleUserStatus, 
    refreshUsers 
  } = useUser();
  const { showSuccess, showError } = useToast();
  
  // Use enum mapping for user roles
  const { enumData: userRoles, loading: rolesLoading } = useEnumMapping({
    enumType: 'USER_ROLE'
  });
  
  // State for pagination and search
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // State for modals
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<UserDto | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);

  // State for forms
  const [formData, setFormData] = useState<CreateUserDto>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Staff',
    isActive: true
  });

  const [passwordData, setPasswordData] = useState<ChangePasswordDto>({
    currentPassword: '',
    newPassword: ''
  });

  // State for operations
  const [operationLoading, setOperationLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // State for change password errors
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);

  // Update formData role when userRoles are loaded
  useEffect(() => {
    if (userRoles.length > 0 && formData.role === 'Staff') {
      setFormData(prev => ({
        ...prev,
        role: userRoles[0].paramKey
      }));
    }
  }, [userRoles]);

  // Debounce search term and fetch data
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPageNumber(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when search changes
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        await refreshUsers(debouncedSearchTerm || undefined);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, [debouncedSearchTerm, refreshUsers]);

  // Reset to first page when filters change
  useEffect(() => {
    setPageNumber(1);
  }, [selectedRole, selectedStatus]);

  // Apply client-side filtering for role and status
  const filteredUsers = users.filter((user: UserDto) => {
    const matchesRole = selectedRole === 'all' || user.role.toLowerCase() === selectedRole.toLowerCase();
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && user.isActive) ||
      (selectedStatus === 'inactive' && !user.isActive);
    
    return matchesRole && matchesStatus;
  });

  // Apply client-side pagination
  const paginatedUsers = filteredUsers.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  // Calculate pagination info from filtered results
  const totalCount = filteredUsers.length;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Enhanced pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setPageNumber(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(pageNumber - 1);
  const goToNextPage = () => goToPage(pageNumber + 1);

  // Generate page numbers for pagination controls with smart ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (pageNumber <= 3) {
        // Near start: show first 3 + last
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (pageNumber >= totalPages - 2) {
        // Near end: show first + last 3
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle: show first + current-1, current, current+1 + last
        pages.push(1);
        pages.push('...');
        pages.push(pageNumber - 1);
        pages.push(pageNumber);
        pages.push(pageNumber + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Handle refresh - clear all filters and reset pagination
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setSearchTerm('');
      setSelectedRole('all');
      setSelectedStatus('all');
      setPageNumber(1);
      setDebouncedSearchTerm('');
      clearError(); // Clear any existing errors
      
      // Refresh all users
      await refreshUsers();
      
      // Add a small delay to show the refresh animation
      await new Promise(resolve => setTimeout(resolve, 500));
      showSuccess('User data refreshed successfully');
    } catch (error) {
      console.error('Error during refresh:', error);
      showError('Failed to refresh user data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setOperationLoading(true);
      
      // Check if email already exists (for new users or when email is changed)
      if (!editingUser || formData.email !== editingUser.email) {
        const emailExists = users.some(user => 
          user.email.toLowerCase() === formData.email.toLowerCase() && 
          user.id !== editingUser?.id
        );
        
        if (emailExists) {
          throw new Error(`Email '${formData.email}' is already taken. Please use a different email address.`);
        }
      }

      // Validate password for new users
      if (!editingUser) {
        validatePassword(formData.password);
        if (passwordError) {
          throw new Error(passwordError);
        }
      }
      
      if (editingUser) {
        const updateData: UpdateUserDto = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        };
        
        await updateUser(editingUser.id, updateData);
        showSuccess(`User ${formData.firstName} ${formData.lastName} updated successfully`);
      } else {
        // Convert CreateUserDto to the format expected by DataContext
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password, // Include password for new users
          role: formData.role,
          isActive: formData.isActive ?? true
        };
        
        await addUser(userData);
        showSuccess(`User ${formData.firstName} ${formData.lastName} created successfully`);
      }
      
      setShowModal(false);
      setEditingUser(null);
      resetForm();
    } catch (err: any) {
      console.error('Failed to save user:', err);
      const errorMessage = err.message || 'Failed to save user. Please try again.';
      showError(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Find the user to delete
    const user = users.find(u => u.id === id);
    if (user) {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setOperationLoading(true);
      await deleteUser(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      showSuccess(`User ${userToDelete.firstName + ' ' + userToDelete.lastName} deleted successfully`);
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      const errorMessage = err.message || 'Failed to delete user. Please try again.';
      showError(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = async (user: UserDto) => {
    try {
      setOperationLoading(true);
      await toggleUserStatus(user.id);
      const newStatus = user.isActive ? 'deactivated' : 'activated';
      showSuccess(`User ${user.firstName + ' ' + user.lastName} ${newStatus} successfully`);
    } catch (err: any) {
      console.error('Failed to toggle user status:', err);
      const errorMessage = err.message || 'Failed to update user status. Please try again.';
      showError(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;

    try {
      setOperationLoading(true);
      setChangePasswordError(null);
      setCurrentPasswordError(null);
      setNewPasswordError(null);

      // Validate current password
      if (!passwordData.currentPassword.trim()) {
        setCurrentPasswordError('Current password is required');
        return;
      }

      // Validate new password
      validateNewPassword(passwordData.newPassword);
      if (newPasswordError) {
        return;
      }

      // Call the API to change password
      await userService.changePassword(selectedUserForPassword.id, passwordData);
      
      // Success - close modal and reset form
      setShowPasswordModal(false);
      setSelectedUserForPassword(null);
      setPasswordData({ currentPassword: '', newPassword: '' });
      setCurrentPasswordError(null);
      setNewPasswordError(null);
      setChangePasswordError(null);
      showSuccess(`Password for ${selectedUserForPassword.firstName + ' ' + selectedUserForPassword.lastName} changed successfully`);
      
    } catch (err: any) {
      console.error('Failed to change password:', err);
      
      // Handle specific error cases
      if (err.response?.status === 400) {
        const errorMessage = err.response.data?.message || err.response.data;
        
        if (errorMessage?.toLowerCase().includes('current password is incorrect')) {
          setCurrentPasswordError('Current password is incorrect');
        } else if (errorMessage?.toLowerCase().includes('password validation failed')) {
          setNewPasswordError('New password does not meet requirements');
        } else if (errorMessage?.toLowerCase().includes('user not found')) {
          setChangePasswordError('User not found');
        } else {
          setChangePasswordError(errorMessage || 'Failed to change password');
        }
      } else if (err.response?.status === 401) {
        setChangePasswordError('You are not authorized to change this password');
      } else if (err.response?.status === 403) {
        setChangePasswordError('You do not have permission to change this password');
      } else {
        setChangePasswordError('Failed to change password. Please try again.');
      }
      
      // Show error toast
      const errorMessage = err.response?.data?.message || err.message || 'Failed to change password. Please try again.';
      showError(errorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEdit = (user: UserDto) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '', // Don't populate password for editing
      role: user.role,
      isActive: user.isActive
    });
    setEmailError(null); // Clear any existing email errors
    setPasswordError(null); // Clear any existing password errors
    setShowModal(true);
  };

  const handlePasswordChange = (user: UserDto) => {
    setSelectedUserForPassword(user);
    setPasswordData({ currentPassword: '', newPassword: '' });
    setShowPasswordModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: userRoles.length > 0 ? userRoles[0].paramKey : 'Staff',
      isActive: true
    });
    setEmailError(null);
    setPasswordError(null);
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError(null);
      return;
    }
    
    // Check if email already exists (for new users or when email is changed)
    if (!editingUser || email !== editingUser.email) {
      const emailExists = users.some(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.id !== editingUser?.id
      );
      
      if (emailExists) {
        setEmailError(`Email '${email}' is already taken. Please use a different email address.`);
        return;
      }
    }
    
    setEmailError(null);
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError(null);
      return;
    }

    const errors: string[] = [];

    // Check minimum length
    if (password.length < 8) {
      errors.push('at least 8 characters');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('at least one uppercase letter (A-Z)');
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('at least one lowercase letter (a-z)');
    }

    // Check for non-alphanumeric character
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('at least one non-alphanumeric character');
    }

    if (errors.length > 0) {
      setPasswordError(`Password must have ${errors.join(', ')}`);
    } else {
      setPasswordError(null);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, requirements: [] };

    const requirements = [
      { met: password.length >= 8, text: 'At least 8 characters' },
      { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
      { met: /[a-z]/.test(password), text: 'One lowercase letter' },
      { met: /[^a-zA-Z0-9]/.test(password), text: 'One special character' }
    ];

    const score = requirements.filter(r => r.met).length;
    return { score, requirements };
  };

  const validateNewPassword = (password: string) => {
    if (!password) {
      setNewPasswordError('New password is required');
      return;
    }

    const errors: string[] = [];

    // Check minimum length
    if (password.length < 8) {
      errors.push('at least 8 characters');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('at least one uppercase letter (A-Z)');
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('at least one lowercase letter (a-z)');
    }

    // Check for non-alphanumeric character
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('at least one non-alphanumeric character');
    }

    if (errors.length > 0) {
      setNewPasswordError(`Password must have ${errors.join(', ')}`);
    } else {
      setNewPasswordError(null);
    }
  };

  const getNewPasswordStrength = (password: string) => {
    if (!password) return { score: 0, requirements: [] };

    const requirements = [
      { met: password.length >= 8, text: 'At least 8 characters' },
      { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
      { met: /[a-z]/.test(password), text: 'One lowercase letter' },
      { met: /[^a-zA-Z0-9]/.test(password), text: 'One special character' }
    ];

    const score = requirements.filter(r => r.met).length;
    return { score, requirements };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorDisplay 
          error={error} 
          onClear={clearError} 
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3" size={28} />
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage system users and their permissions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={operationLoading || refreshing}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              disabled={operationLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Plus size={20} />
              <span>Add User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={rolesLoading}
            >
              <option value="all">All Roles</option>
              {rolesLoading ? (
                <option>Loading roles...</option>
              ) : (
                userRoles.map((role) => (
                  <option key={role.paramKey} value={role.paramKey.toLowerCase()}>
                    {role.paramValue}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {user.firstName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.firstName + ' ' + user.lastName}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail size={14} className="mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role.toLowerCase() === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : user.role.toLowerCase() === 'manager'
                          ? 'bg-blue-100 text-blue-800'
                          : user.role.toLowerCase() === 'supervisor'
                          ? 'bg-orange-100 text-orange-800'
                          : user.role.toLowerCase() === 'volunteer'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.roleDisplayName || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={operationLoading}
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        } disabled:opacity-50`}
                      >
                        {user.isActive ? (
                          <>
                            <CheckCircle size={14} className="mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle size={14} className="mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          disabled={operationLoading}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 disabled:opacity-50"
                          title="Edit user"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handlePasswordChange(user)}
                          disabled={operationLoading}
                          className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 disabled:opacity-50"
                          title="Change password"
                        >
                          <Lock size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={operationLoading}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                          title="Delete user"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Users size={48} className="text-gray-300" />
                      <div className="text-gray-500">
                        {users.length === 0 ? (
                          <p className="text-lg font-medium">No users found</p>
                        ) : filteredUsers.length === 0 ? (
                          <>
                            <p className="text-lg font-medium">No users match your filters</p>
                            <p className="text-sm">Try adjusting your filters or search terms</p>
                          </>
                        ) : (
                          <>
                            <p className="text-lg font-medium">No users on this page</p>
                            <p className="text-sm">Try going to a different page</p>
                          </>
                        )}
                      </div>
                      {users.length === 0 && (
                        <button
                          onClick={() => setShowModal(true)}
                          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                          <Plus size={16} />
                          <span>Add First User</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Page info and page size selector */}
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700">
                    Showing {totalCount > 0 ? ((pageNumber - 1) * pageSize) + 1 : 0} to {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} results
                  </div>
                </div>

              {/* Enhanced pagination controls */}
              <div className="flex items-center space-x-1">
                {/* First page */}
                <button
                  onClick={goToFirstPage}
                  disabled={pageNumber === 1 || operationLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    pageNumber === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } disabled:opacity-50`}
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>

                {/* Previous page */}
                <button
                  onClick={goToPreviousPage}
                  disabled={pageNumber === 1 || operationLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    pageNumber === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } disabled:opacity-50`}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page numbers with smart ellipsis */}
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-2 py-1 text-gray-400">...</span>
                      ) : (
                        <button
                          onClick={() => goToPage(page as number)}
                          disabled={operationLoading}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            pageNumber === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          } disabled:opacity-50`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Next page */}
                <button
                  onClick={goToNextPage}
                  disabled={pageNumber === totalPages || operationLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    pageNumber === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } disabled:opacity-50`}
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Last page */}
                <button
                  onClick={goToLastPage}
                  disabled={pageNumber === totalPages || operationLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    pageNumber === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } disabled:opacity-50`}
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    emailError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    validateEmail(e.target.value);
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      passwordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      validatePassword(e.target.value);
                    }}
                    onBlur={(e) => validatePassword(e.target.value)}
                  />
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                  )}
                  <div className="mt-2 space-y-1">
                    {getPasswordStrength(formData.password).requirements.map((req, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <div className={`w-2 h-2 rounded-full mr-2 ${req.met ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  disabled={rolesLoading}
                >
                  {rolesLoading ? (
                    <option>Loading roles...</option>
                  ) : (
                    userRoles.map((role) => (
                      <option key={role.paramKey} value={role.paramKey}>
                        {role.paramValue}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading || !!emailError || !!passwordError}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {operationLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingUser ? 'Update' : 'Add'} User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedUserForPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Change Password for {selectedUserForPassword.firstName + ' ' + selectedUserForPassword.lastName}
            </h2>
            
            {/* Global error message */}
            {changePasswordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{changePasswordError}</p>
              </div>
            )}
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    currentPasswordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData({...passwordData, currentPassword: e.target.value});
                    if (currentPasswordError) setCurrentPasswordError(null);
                  }}
                />
                {currentPasswordError && (
                  <p className="mt-1 text-sm text-red-600">{currentPasswordError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    newPasswordError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
                  }`}
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({...passwordData, newPassword: e.target.value});
                    validateNewPassword(e.target.value);
                  }}
                  onBlur={(e) => validateNewPassword(e.target.value)}
                />
                {newPasswordError && (
                  <p className="mt-1 text-sm text-red-600">{newPasswordError}</p>
                )}
                <div className="mt-2 space-y-1">
                  {getNewPasswordStrength(passwordData.newPassword).requirements.map((req, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <div className={`w-2 h-2 rounded-full mr-2 ${req.met ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUserForPassword(null);
                    setPasswordData({ currentPassword: '', newPassword: '' });
                    setCurrentPasswordError(null);
                    setNewPasswordError(null);
                    setChangePasswordError(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading || !!currentPasswordError || !!newPasswordError}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {operationLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>Change Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{userToDelete.firstName + ' ' + userToDelete.lastName}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This will permanently remove the user account and all associated data.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={operationLoading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={operationLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {operationLoading && <Loader2 size={16} className="animate-spin" />}
                <span>Delete User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;