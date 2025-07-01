import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { 
  UserCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Heart,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { ClientDto, CreateClientDto, UpdateClientDto } from '../services/clientService';
import { userService, UserDto } from '../services/userService';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import { useToast } from '../hooks/useToast';

const ClientManagement: React.FC = () => {
  const { clients, addClient, updateClient, deleteClient, refreshClients, loading, error } = useData();
  const { showSuccess, showError } = useToast();
  
  // State for pagination and search
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // State for staff users
  const [staffUsers, setStaffUsers] = useState<UserDto[]>([]);

  // State for modals
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDto | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientDto | null>(null);

  // State for forms
  const [formData, setFormData] = useState<CreateClientDto>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    email: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalNotes: '',
    assignedStaffId: '',
    isActive: true
  });

  // State for operations
  const [operationLoading, setOperationLoading] = useState(false);

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false);

  // State for validation errors
  const [phoneError, setPhoneError] = useState('');

  // Phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  // Handle phone number input change with validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isEmergency: boolean = false) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    const maxLength = 10;
    
    if (value.length <= maxLength) {
      if (isEmergency) {
        setFormData({...formData, emergencyPhone: value});
      } else {
        setFormData({...formData, phoneNumber: value});
        setPhoneError('');
      }
    }
  };

  // Validate phone numbers before form submission
  const validateForm = (): boolean => {
    let isValid = true;
    
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      setPhoneError('Phone number must be exactly 10 digits');
      isValid = false;
    } else {
      setPhoneError('');
    }
    
    return isValid;
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPageNumber(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load staff users on component mount
  useEffect(() => {
    loadStaffUsers();
  }, []);

  // Filter clients based on search term
  const filteredClients = clients.filter(client => {
    if (!debouncedSearchTerm) return true;
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      client.firstName.toLowerCase().includes(searchLower) ||
      client.lastName.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phoneNumber.includes(searchLower)
    );
  });

  // Paginate filtered clients
  const paginatedClients = filteredClients.slice(
    (pageNumber - 1) * pageSize,
    pageNumber * pageSize
  );

  const totalCount = filteredClients.length;

  const loadStaffUsers = async () => {
    try {
      const response = await userService.getAllUsers(1, 100); // Get all users
      const staff = response.users.filter(u => u.role.toLowerCase() === 'staff' && u.isActive);
      setStaffUsers(staff);
    } catch (err: any) {
      console.error('Failed to load staff users:', err);
      showError('Failed to load staff users');
    }
  };

  // Handle refresh - clear all filters and reset pagination
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Clear all filters
      setSearchTerm('');
      setDebouncedSearchTerm('');
      setPageNumber(1);
      
      // Refresh clients data
      await refreshClients();
      
      // Add a small delay to show the refresh animation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showSuccess('Client list refreshed successfully');
    } catch (error) {
      console.error('Error during refresh:', error);
      showError('Failed to refresh client list');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone numbers before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      setOperationLoading(true);
      
      if (editingClient) {
        const updateData: UpdateClientDto = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          medicalNotes: formData.medicalNotes,
          assignedStaffId: formData.assignedStaffId || undefined,
          isActive: formData.isActive
        };
        
        await updateClient(editingClient.id, updateData);
        showSuccess('Client updated successfully');
      } else {
        await addClient(formData);
        showSuccess('Client added successfully');
      }
      
      setShowModal(false);
      setEditingClient(null);
      resetForm();
    } catch (err: any) {
      console.error('Failed to save client:', err);
      showError('Failed to save client');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setOperationLoading(true);
      await deleteClient(id);
      showSuccess('Client deleted successfully');
      setClientToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete client:', err);
      showError('Failed to delete client');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleToggleActive = async (client: ClientDto) => {
    try {
      setOperationLoading(true);
      const updateData: UpdateClientDto = {
        firstName: client.firstName,
        lastName: client.lastName,
        dateOfBirth: client.dateOfBirth,
        address: client.address,
        phoneNumber: client.phoneNumber,
        email: client.email,
        emergencyContact: client.emergencyContact,
        emergencyPhone: client.emergencyPhone,
        medicalNotes: client.medicalNotes,
        assignedStaffId: client.assignedStaffId || undefined,
        isActive: !client.isActive // Toggle the active status
      };
      
      await updateClient(client.id, updateData);
      showSuccess(`Client ${!client.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      console.error('Failed to update client status:', err);
      showError('Failed to update client status');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEdit = (client: ClientDto) => {
    setEditingClient(client);
    setFormData({
      firstName: client.firstName,
      lastName: client.lastName,
      dateOfBirth: client.dateOfBirth.split('T')[0], // Convert to date input format
      address: client.address,
      phoneNumber: client.phoneNumber,
      email: client.email,
      emergencyContact: client.emergencyContact,
      emergencyPhone: client.emergencyPhone,
      medicalNotes: client.medicalNotes,
      assignedStaffId: client.assignedStaffId || '',
      isActive: client.isActive
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      address: '',
      phoneNumber: '',
      email: '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalNotes: '',
      assignedStaffId: '',
      isActive: true
    });
  };

  const getStaffName = (staffId?: string) => {
    if (!staffId) return 'No staff assigned';
    const staff = staffUsers.find(u => u.id === staffId);
    return staff ? staff.fullName : 'Unknown Staff';
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <ErrorDisplay 
          error={error} 
          onClear={() => console.error('Error cleared')} 
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserCheck className="mr-3" size={28} />
              Client Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage clients and their assigned staff
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={operationLoading || refreshing}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
              title="Clear all filters"
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
              <span>Add Client</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search clients by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedClients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-lg">
                    {client.firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{client.fullName}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    client.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleActive(client)}
                  disabled={operationLoading}
                  className={`p-2 rounded-full transition-all duration-200 hover:scale-110 disabled:opacity-50 ${
                    client.isActive 
                      ? 'text-red-500 hover:bg-red-50' 
                      : 'text-gray-400 hover:bg-gray-50'
                  }`}
                  title={client.isActive ? 'Deactivate client' : 'Activate client'}
                >
                  <Heart 
                    size={20} 
                    className={client.isActive ? 'fill-current' : ''} 
                  />
                </button>
                <button
                  onClick={() => handleEdit(client)}
                  disabled={operationLoading}
                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 disabled:opacity-50"
                  title="Edit client"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => {
                    setClientToDelete(client);
                    setShowDeleteModal(true);
                  }}
                  disabled={operationLoading}
                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                  title="Delete client"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail size={14} className="mr-2" />
                {client.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone size={14} className="mr-2" />
                {client.phoneNumber}
              </div>
              <div className="flex items-start text-sm text-gray-600">
                <MapPin size={14} className="mr-2 mt-0.5" />
                <span className="line-clamp-2">{client.address}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users size={14} className="mr-2" />
                <span className="line-clamp-1">
                  {getStaffName(client.assignedStaffId)}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={14} className="mr-2" />
                Added {new Date(client.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pageNumber - 1) * pageSize) + 1} to {Math.min(pageNumber * pageSize, totalCount)} of {totalCount} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPageNumber(page => Math.max(1, page - 1))}
                disabled={pageNumber === 1 || operationLoading}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-700">
                Page {pageNumber} of {totalPages}
              </span>
              <button
                onClick={() => setPageNumber(page => Math.min(totalPages, page + 1))}
                disabled={pageNumber === totalPages || operationLoading}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingClient ? 'Edit Client' : 'Add New Client'}
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
                  Date of Birth
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    phoneError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.phoneNumber}
                  onChange={(e) => handlePhoneChange(e)}
                  placeholder="Enter 10-digit phone number"
                />
                {phoneError && (
                  <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Staff
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.assignedStaffId}
                  onChange={(e) => setFormData({...formData, assignedStaffId: e.target.value})}
                >
                  <option value="">No staff assigned</option>
                  {staffUsers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.fullName}
                    </option>
                  ))}
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
                    setEditingClient(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {operationLoading && <Loader2 size={16} className="animate-spin" />}
                  <span>{editingClient ? 'Update' : 'Add'} Client</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && clientToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Delete Client
              </h2>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete this client? 
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {clientToDelete.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{clientToDelete.fullName}</h3>
                    <p className="text-sm text-gray-600">{clientToDelete.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Phone: {clientToDelete.phoneNumber}</p>
                  <p>Status: <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    clientToDelete.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {clientToDelete.isActive ? 'Active' : 'Inactive'}
                  </span></p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setClientToDelete(null);
                }}
                disabled={operationLoading}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (clientToDelete) {
                    await handleDelete(clientToDelete.id);
                  }
                  setShowDeleteModal(false);
                  setClientToDelete(null);
                }}
                disabled={operationLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {operationLoading && <Loader2 size={16} className="animate-spin" />}
                <span>Delete Client</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;