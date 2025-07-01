import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useEnumMapping } from '../hooks/useEnumMapping';
import { useToast } from '../hooks/useToast';
import { ClientDto } from '../services/clientService';
import { User } from '../services/authService';
import FileUpload from './FileUpload';
import { FileUploadService } from '../services/fileUploadService';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  MapPin,
  User as UserIcon,
  Clock,
  Camera,
  Eye,
  X,
  RefreshCw,
  File,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const IncidentManagement: React.FC = () => {
  const { incidents, clients, users, addIncident } = useData();
  const { user, isAdmin } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    clientId: '',
    staffId: user?.id || '',
    title: '',
    description: '',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: new Date().toTimeString().split(' ')[0],
    location: '',
    fileName: '',
    severity: 2, // Default to Medium (will be updated when metadata loads)
    status: 1    // Default to Open (will be updated when metadata loads)
  });

  // Use automatic enum mapping instead of static enums
  const { 
    enumData: severityOptions, 
    loading: severityLoading, 
  } = useEnumMapping({ 
    enumType: 'INCIDENT_SEVERITY', 
    autoRefresh: true 
  });

  const { 
    enumData: statusOptions, 
    loading: statusLoading, 
  } = useEnumMapping({ 
    enumType: 'INCIDENT_STATUS', 
    autoRefresh: true 
  });

  // Update form data when user changes
  useEffect(() => {
    if (user?.id) {
      setFormData(prev => ({
        ...prev,
        staffId: user.id
      }));
    }
  }, [user?.id]);

  // Update default values when metadata loads
  useEffect(() => {
    if (severityOptions.length > 0 && statusOptions.length > 0) {
      const mediumSeverity = severityOptions.find(s => s.paramKey === 'Medium');
      const openStatus = statusOptions.find(s => s.paramKey === 'Open');
      
      setFormData(prev => ({
        ...prev,
        severity: mediumSeverity?.paramValueInt || 2,
        status: openStatus?.paramValueInt || 1
      }));
    }
  }, [severityOptions, statusOptions]);

  // Reset form to initial state
  const resetForm = () => {
    const mediumSeverity = severityOptions.find(s => s.paramKey === 'Medium');
    const openStatus = statusOptions.find(s => s.paramKey === 'Open');
    
    setFormData({
      clientId: '',
      staffId: user?.id || '',
      title: '',
      description: '',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentTime: new Date().toTimeString().split(' ')[0],
      location: '',
      fileName: '',
      severity: mediumSeverity?.paramValueInt || 2,
      status: openStatus?.paramValueInt || 1
    });
    setSelectedFile(null);
    setUploadedFileName('');
  };

  // Handle modal open
  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Handle refresh - clear all filters and reset pagination
  const handleRefresh = () => {
    setSearchTerm('');
    setDateFilter('');
    setClientFilter('');
    setStaffFilter('');
    setCurrentPage(1); // Reset to first page
    showInfo('Filters cleared and data refreshed');
  };

  // Handle file selection
  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  // Handle file removal
  const handleRemoveFile = async () => {
    if (uploadedFileName) {
      try {
        await FileUploadService.deleteFile(uploadedFileName);
        setUploadedFileName('');
        setFormData(prev => ({
          ...prev,
          fileName: ''
        }));
        showSuccess('File removed successfully');
      } catch (error) {
        console.error('Error removing file:', error);
        showError('Failed to remove file. Please try again.');
        // Even if deletion fails, clear the local state
        setUploadedFileName('');
        setFormData(prev => ({
          ...prev,
          fileName: ''
        }));
      }
    }
  };

  // Handle file download
  const handleDownloadFile = async () => {
    if (uploadedFileName) {
      try {
        await FileUploadService.downloadAndSaveFile(uploadedFileName);
        showSuccess('File downloaded successfully');
      } catch (error) {
        console.error('Error downloading file:', error);
        showError('Failed to download file. Please try again.');
      }
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = !searchTerm || 
                         incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (incident.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || incident.incidentDate === dateFilter;
    const matchesClient = !clientFilter || incident.clientId?.toString() === clientFilter;
    const matchesStaff = !staffFilter || incident.staffId === staffFilter;

    const matchesUserAccess = true; // Temporarily show all incidents
    
    return matchesSearch && matchesDate && matchesClient && matchesStaff && matchesUserAccess;
  });

  // Pagination calculations
  const totalItems = filteredIncidents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, clientFilter, staffFilter]);

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers for pagination controls
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
      if (currentPage <= 3) {
        // Near start: show first 3 + last
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
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
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Add safety checks for clients data
      if (!clients || !Array.isArray(clients)) {
        console.error('❌ IncidentManagement - Clients data is not available');
        return;
      }
      
      const client = clients.find(c => c.id.toString() === formData.clientId);
      
      // Handle the case where users is an object with a users property
      let usersArray = users;
      if (users && typeof users === 'object' && 'users' in users && Array.isArray(users.users)) {
        usersArray = users.users;
      }
      
      if (!usersArray || !Array.isArray(usersArray)) {
        console.error('❌ IncidentManagement - Users data is not available');
        return;
      }
      const staff = usersArray.find(u => u.id === formData.staffId);
      
      if (!client || !staff) {
        console.error('❌ IncidentManagement - Client or staff not found:', { client, staff });
        return;
      }
      
      // Upload file first if selected
      let fileName = formData.fileName;
      if (selectedFile) {
        try {
          const response = await FileUploadService.uploadFileGeneral(selectedFile);
          fileName = response.fileName;
          showInfo('File uploaded successfully');
        } catch (error) {
          console.error('Error uploading file:', error);
          showError('Failed to upload file. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }
      
      const incidentData = {
        clientId: parseInt(formData.clientId) || 0,
        staffId: formData.staffId,
        title: formData.title,
        description: formData.description,
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime,
        location: formData.location,
        fileName: fileName || undefined,
        severity: formData.severity,
        status: formData.status
      };
      
      // Validate required fields
      if (!incidentData.clientId) {
        showError('Client ID is required');
        return;
      }
      
      if (!incidentData.staffId) {
        showError('Staff ID is required');
        return;
      }
      
      handleCloseModal();
      
      // Add the incident
      await addIncident(incidentData);
      showSuccess('Incident reported successfully');
      
      // Clear filters to show the new incident
      setSearchTerm('');
      setDateFilter('');
      setClientFilter('');
      setStaffFilter('');
      
    } catch (error) {
      console.error('❌ IncidentManagement - Failed to add incident:', error);
      showError('Failed to report incident. Please try again.');
      // Reopen modal if there was an error
      handleOpenModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClientOptions = () => {
    if (!clients || !Array.isArray(clients)) {
      return [];
    }
    
    let filteredClients;
    if (isAdmin) {
      filteredClients = clients.filter(c => c.isActive !== false); 
    } else {
      filteredClients = clients.filter(c => {
        const isActive = c.isActive !== false;
        return isActive;
      });
    }
    return filteredClients;
  };

  const getStaffOptions = () => {
    let usersArray = users;
    if (users && typeof users === 'object' && 'users' in users && Array.isArray(users.users)) {
      usersArray = users.users;
    }
    
    if (!usersArray || !Array.isArray(usersArray)) {
      return [];
    }
    
    const staffUsers = usersArray.filter(u => {
      const role = u.role;
      const isStaff = role === 'Staff'; // Only show users with exact role 'Staff'
      const isActive = u.isActive !== false; 
      
      return isStaff && isActive;
    });

    let finalStaffUsers;
    if (isAdmin) {
      finalStaffUsers = staffUsers;
    } else {
      const currentUserIsStaff = staffUsers.some(u => u.id === user?.id);
      if (currentUserIsStaff) {
        finalStaffUsers = staffUsers.filter(u => u.id === user?.id);
      } else {
        finalStaffUsers = staffUsers;
      }
    }
    return finalStaffUsers;
  };

  const getDisplayName = (person: ClientDto | User | any) => {
    if (!person) return 'Unknown';
    
    if (person.fullName && person.fullName.trim() !== '') {
      return person.fullName.trim();
    } else if (person.firstName && person.lastName) {
      return `${person.firstName.trim()} ${person.lastName.trim()}`;
    } else if (person.firstName) {
      return person.firstName.trim();
    } else if (person.lastName) {
      return person.lastName.trim();
    } else {
      return `User ${person.id}`;
    }
  };

  // Helper functions for getting display names and colors
  const getSeverityDisplayName = (severity: number): string => {
    const option = severityOptions.find(s => s.paramValueInt === severity);
    return option?.paramKey || 'Unknown';
  };

  const getStatusDisplayName = (status: number): string => {
    const option = statusOptions.find(s => s.paramValueInt === status);
    return option?.paramKey || 'Unknown';
  };

  const getSeverityColor = (severity: number): string => {
    switch (severity) {
      case 1: return 'bg-green-100 text-green-800'; // Low
      case 2: return 'bg-yellow-100 text-yellow-800'; // Medium
      case 3: return 'bg-orange-100 text-orange-800'; // High
      case 4: return 'bg-red-100 text-red-800'; // Critical
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 1: return 'bg-red-100 text-red-800'; // Open
      case 2: return 'bg-orange-100 text-orange-800'; // In Progress
      case 3: return 'bg-green-100 text-green-800'; // Resolved
      case 4: return 'bg-gray-100 text-gray-800'; // Closed
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="mr-3 text-red-500" size={28} />
              Incident Management
            </h1>
            <p className="text-gray-600 mt-1">Track and manage client incidents and safety reports</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              title="Clear all filters"
            >
              <RefreshCw size={20} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleOpenModal}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Report Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-900">{filteredIncidents.length}</p>
            </div>
            <AlertTriangle className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-orange-600">
                {filteredIncidents.filter(incident => {
                  const incidentDate = new Date(incident.incidentDate);
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  return incidentDate >= weekAgo && incidentDate <= today;
                }).length}
              </p>
            </div>
            <Calendar className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredIncidents.filter(incident => {
                  const incidentDate = new Date(incident.incidentDate);
                  const today = new Date();
                  return incidentDate.getMonth() === today.getMonth() && 
                         incidentDate.getFullYear() === today.getFullYear();
                }).length}
              </p>
            </div>
            <UserIcon className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Photos</p>
              <p className="text-2xl font-bold text-blue-600">
                {filteredIncidents.filter(incident => incident.fileName).length}
              </p>
            </div>
            <Camera className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search incidents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div>
            {(() => {
              const clientOptions = getClientOptions();
              return (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                >
                  <option value="">All Clients</option>
                  {clientOptions.map((client: ClientDto) => {
                    const displayName = getDisplayName(client);
                    return (
                      <option key={client.id} value={client.id}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              );
            })()}
          </div>
          <div>
            {(() => {
              const staffOptions = getStaffOptions();
              return (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={staffFilter}
                  onChange={(e) => setStaffFilter(e.target.value)}
                >
                  <option value="">All Staff</option>
                  {staffOptions && staffOptions.length > 0 ? (
                    staffOptions.map((staff: User) => {
                      const displayName = getDisplayName(staff);
                      return (
                        <option key={staff.id} value={staff.id}>
                          {displayName}
                        </option>
                      );
                    })
                  ) : (
                    <option value="" disabled>No staff available</option>
                  )}
                </select>
              );
            })()}
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredIncidents.length} incidents found
            </span>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <AlertTriangle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || dateFilter || clientFilter || staffFilter 
                ? 'Try adjusting your filters to see more results.' 
                : 'No incidents have been reported yet.'}
            </p>
            {searchTerm || dateFilter || clientFilter || staffFilter ? (
              <button
                onClick={handleRefresh}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleOpenModal}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Report First Incident
              </button>
            )}
          </div>
        ) : (
          <>
            {paginatedIncidents.map((incident) => (
              <div 
                key={incident.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 group"
              >
                <div className="p-6">
                  {/* Header Row - Primary Information */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getSeverityColor(incident.severity)}`}>
                          {getSeverityDisplayName(incident.severity)}
                        </span>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                          {getStatusDisplayName(incident.status)}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          {new Date(incident.incidentDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock size={14} className="mr-1" />
                          {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      
                      {/* Title - Most Important Information */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {incident.title}
                      </h3>
                    </div>
                    
                    {/* Action Button */}
                    <div className="flex items-center space-x-2 ml-4">
                      {incident.fileName && (
                        <button
                          onClick={async () => {
                            if (incident.fileName) {
                              try {
                                await FileUploadService.downloadAndSaveFile(incident.fileName);
                                showSuccess('File downloaded successfully');
                              } catch (error) {
                                console.error('Error downloading file:', error);
                                showError('Failed to download file. Please try again.');
                              }
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Download attached file"
                        >
                          <Download size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedIncident(incident)}
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors group-hover:bg-gray-50"
                        title="View incident details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Secondary Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Client</p>
                        <p className="text-sm font-medium text-gray-900">{incident.clientName || 'Unknown Client'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <UserIcon size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Reported by</p>
                        <p className="text-sm font-medium text-gray-900">{incident.staffName || 'Unknown Staff'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <MapPin size={16} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Location</p>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{incident.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description - Collapsible for Better Scanning */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</p>
                      {incident.fileName && (
                        <div className="flex items-center text-xs text-blue-600">
                          <File size={12} className="mr-1" />
                          File attached
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                      {incident.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  {/* Page info */}
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} incidents
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center space-x-1">
                    {/* First page */}
                    <button
                      onClick={goToFirstPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title="First page"
                    >
                      <ChevronsLeft size={16} />
                    </button>

                    {/* Previous page */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                          {page === '...' ? (
                            <span className="px-2 py-1 text-gray-400">...</span>
                          ) : (
                            <button
                              onClick={() => goToPage(page as number)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
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
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>

                    {/* Last page */}
                    <button
                      onClick={goToLastPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-colors ${
                        currentPage === totalPages
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title="Last page"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Incident Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Report Incident</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client
                  </label>
                  {(() => {
                    const clientOptions = getClientOptions();
                    return (
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.clientId}
                        onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                      >
                        <option value="">Select a client</option>
                        {clientOptions.map((client: ClientDto) => {
                          const displayName = getDisplayName(client);
                          return (
                            <option key={client.id} value={client.id}>
                              {displayName}
                            </option>
                          );
                        })}
                      </select>
                    );
                  })()}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Staff Member
                  </label>
                  {(() => {
                    const staffOptions = getStaffOptions();
                    return (
                      <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.staffId}
                        onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                      >
                        <option value="">Select staff member</option>
                        {staffOptions && staffOptions.length > 0 ? (
                          staffOptions.map((staff: User) => {
                            const displayName = getDisplayName(staff);
                            return (
                              <option key={staff.id} value={staff.id}>
                                {displayName}
                              </option>
                            );
                          })
                        ) : (
                          <option value="" disabled>No staff available</option>
                        )}
                      </select>
                    );
                  })()}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Incident Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Minor Fall, Medication Error, etc."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.incidentTime}
                    onChange={(e) => setFormData({...formData, incidentTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity
                  </label>
                  <select
                    required
                    disabled={severityLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: parseInt(e.target.value)})}
                  >
                    {severityLoading ? (
                      <option>Loading severity options...</option>
                    ) : (
                      severityOptions.map((option) => (
                        <option key={option.paramValueInt} value={option.paramValueInt}>
                          {option.paramKey}
                        </option>
                      ))
                    )}
                  </select> 
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    required
                    disabled={statusLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}
                  >
                    {statusLoading ? (
                      <option>Loading status options...</option>
                    ) : (
                      statusOptions.map((option) => (
                        <option key={option.paramValueInt} value={option.paramValueInt}>
                          {option.paramKey}
                        </option>
                      ))
                    )}
                  </select>
                  </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Where did the incident occur?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Provide a detailed description of what happened..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach File (Optional)
                </label>
                <FileUpload
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                  uploadedFileName={uploadedFileName}
                  onRemoveFile={handleRemoveFile}
                  onDownloadFile={handleDownloadFile}
                  acceptedTypes=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                  maxSizeMB={50}
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || severityLoading || statusLoading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    isSubmitting || severityLoading || statusLoading
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 
                   severityLoading || statusLoading ? 'Loading...' : 'Report Incident'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Incident Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Incident Details</h2>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getSeverityColor(selectedIncident.severity)}`}>
                  {getSeverityDisplayName(selectedIncident.severity)}
                </span>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedIncident.status)}`}>
                  {getStatusDisplayName(selectedIncident.status)}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  {new Date(selectedIncident.incidentDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={14} className="mr-1" />
                  {new Date(selectedIncident.createdAt).toLocaleTimeString()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Client</p>
                  <p className="text-gray-900">{selectedIncident.clientName || 'Unknown Client'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Reported by</p>
                  <p className="text-gray-900">{selectedIncident.staffName || 'Unknown Staff'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Location</p>
                  <p className="text-gray-900 flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {selectedIncident.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Reported on</p>
                  <p className="text-gray-900">{new Date(selectedIncident.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Title</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 font-medium">{selectedIncident.title}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">{selectedIncident.description}</p>
                </div>
              </div>
              
              {selectedIncident.fileName && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Attached File</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <File size={20} className="text-blue-500" />
                        <div>
                          <p className="text-gray-900 font-medium">{selectedIncident.fileName}</p>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (selectedIncident.fileName) {
                            try {
                              await FileUploadService.downloadAndSaveFile(selectedIncident.fileName);
                              showSuccess('File downloaded successfully');
                            } catch (error) {
                              console.error('Error downloading file:', error);
                              showError('Failed to download file. Please try again.');
                            }
                          }
                        }}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50"
                        title="Download file"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManagement;