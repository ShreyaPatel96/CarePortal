import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useEnumMapping } from '../hooks/useEnumMapping';
import { 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  User,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const JobTimeManagement: React.FC = () => {
  const { jobTimes, clients, users, addJobTime, refreshJobTimes } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [staffFilter, setStaffFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    staffId: user?.id || '',
    clientId: '',
    startTime: '',
    endTime: '',
    date: '',
    activityType: '',
    notes: ''
  });

  // Use automatic enum mapping instead of static enums
  const { 
    enumData: activityTypes, 
    loading: metadataLoading, 
    getEnumValue 
  } = useEnumMapping({ 
    enumType: 'ACTIVITY_TYPE', 
    autoRefresh: true 
  });

  // Refresh job times when component mounts
  useEffect(() => {
    refreshJobTimes();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, clientFilter, staffFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear all filters
      setSearchTerm('');
      setDateFilter('');
      setClientFilter('');
      setStaffFilter('');
      setCurrentPage(1);
      
      await refreshJobTimes();
    } catch (error) {
      console.error('❌ JobTimeManagement - Manual refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredJobTimes = jobTimes.filter(job => {
    const matchesSearch = job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.activityTypeDisplayName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || new Date(job.startTime).toISOString().split('T')[0] === dateFilter;
    const matchesClient = !clientFilter || job.clientId.toString() === clientFilter;
    const matchesStaff = !staffFilter || job.staffId === staffFilter;
    
    return matchesSearch && matchesDate && matchesClient && matchesStaff;
  });

  // Pagination calculations
  const totalItems = filteredJobTimes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobTimes = filteredJobTimes.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const client = clients.find(c => c.id.toString() === formData.clientId);
    
    // Handle the case where users is an object with a users property
    let usersArray = users;
    if (users && typeof users === 'object' && 'users' in users && Array.isArray(users.users)) {
      usersArray = users.users;
    }
    
    const staff = usersArray.find(u => u.id === formData.staffId);
    
    if (client && staff) {
      try {
        // Use automatic enum mapping instead of static getEnumValue function
        const activityTypeValue = getEnumValue(formData.activityType);
        
        const jobTimeData = {
          clientId: parseInt(formData.clientId),
          staffId: formData.staffId,
          startTime: new Date(`${formData.date}T${formData.startTime}`).toISOString(),
          endTime: formData.endTime ? new Date(`${formData.date}T${formData.endTime}`).toISOString() : undefined,
          activityType: activityTypeValue,
          notes: formData.notes
        };
        
        await addJobTime(jobTimeData);
        
        setShowModal(false);
        setFormData({
          staffId: user?.id || '',
          clientId: '',
          startTime: '',
          endTime: '',
          date: '',
          activityType: '',
          notes: ''
        });
      } catch (error) {
        console.error('❌ JobTimeManagement - Failed to add job time:', error);
      }
    } else {
      console.error('❌ JobTimeManagement - Client or staff not found:', { client, staff });
    }
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  const getClientOptions = () => {
    // Add safety checks for clients data
    if (!clients || !Array.isArray(clients)) {
      return [];
    }
    const allActiveClients = clients.filter(c => c.isActive);
    return allActiveClients;
  };

  const getStaffOptions = () => {
    let usersArray = users;
    if (users && typeof users === 'object' && 'users' in users && Array.isArray(users.users)) {
      usersArray = users.users;
    }
    
    if (!usersArray || !Array.isArray(usersArray)) {
      return [];
    }
    
    // Filter for staff users only (case-insensitive)
    const staffUsers = usersArray.filter(u => 
      u.role && u.role.toLowerCase() === 'staff' && u.isActive
    );
    return staffUsers;
  };

  const getDisplayName = (person: any) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Clock className="mr-3" size={28} />
              Job Time Management
            </h1>
            <p className="text-gray-600 mt-1">Track and manage staff activities and time logs</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => {
                setShowModal(true);
                setFormData({
                  staffId: user?.id || '',
                  clientId: '',
                  startTime: '',
                  endTime: '',
                  date: new Date().toISOString().split('T')[0],
                  activityType: '',
                  notes: ''
                });
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Log Time</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{filteredJobTimes.length}</p>
            </div>
            <Clock className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Logs</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredJobTimes.filter(job => new Date(job.startTime).toISOString().split('T')[0] === new Date().toISOString().split('T')[0]).length}
              </p>
            </div>
            <Calendar className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredJobTimes.filter(job => {
                  const jobDate = new Date(job.startTime);
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  return jobDate >= weekAgo && jobDate <= today;
                }).length}
              </p>
            </div>
            <User className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hours</p>
              <p className="text-2xl font-bold text-amber-600">
                {filteredJobTimes.reduce((total, job) => {
                  if (job.startTime && job.endTime) {
                    const start = new Date(job.startTime);
                    const end = new Date(job.endTime);
                    return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                  }
                  return total;
                }, 0).toFixed(1)}h
              </p>
            </div>
            <FileText className="text-amber-500" size={24} />
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
              placeholder="Search logs..."
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
                  {clientOptions.map((client) => (
                    <option key={client.id} value={client.id}>
                      {getDisplayName(client)}
                    </option>
                  ))}
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
                  {staffOptions.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {getDisplayName(staff)}
                    </option>
                  ))}
                </select>
              );
            })()}
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredJobTimes.length} logs found
            </span>
          </div>
        </div>
      </div>

      {/* Job Times Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentJobTimes.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(job.startTime).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(job.startTime).toLocaleTimeString()} - {job.endTime ? new Date(job.endTime).toLocaleTimeString() : 'Ongoing'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.clientName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.staffName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {job.activityTypeDisplayName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.startTime && job.endTime ? calculateDuration(job.startTime, job.endTime) : 'Ongoing'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {job.notes || 'No notes'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && goToPage(page)}
                      disabled={page === '...'}
                      className={`px-3 py-1 text-sm rounded ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : page === '...'
                          ? 'text-gray-400 cursor-default'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Job Time Modal */}
      {showModal && 
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Log Time</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        {staffOptions.map((staff) => (
                          <option key={staff.id} value={staff.id}>
                            {getDisplayName(staff)}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
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
                      {clientOptions.map((client) => (
                        <option key={client.id} value={client.id}>
                          {getDisplayName(client)}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time (Optional)
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.activityType}
                  onChange={(e) => setFormData({...formData, activityType: e.target.value})}
                >
                  <option value="">
                    {metadataLoading ? 'Loading activity types...' : 'Select activity type'}
                  </option>
                  {activityTypes && activityTypes.length > 0 ? (
                    activityTypes.map((option, index) => (
                      <option key={`${option.paramKey}-${index}`} value={option.paramKey}>
                        {option.paramValue}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {metadataLoading ? 'Loading...' : 'No activity types available'}
                    </option>
                  )}
                </select>
                {metadataLoading && (
                  <p className="text-sm text-gray-500 mt-1">Loading activity types...</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add any additional notes about this activity..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      staffId: user?.id || '',
                      clientId: '',
                      startTime: '',
                      endTime: '',
                      date: '',
                      activityType: '',
                      notes: ''
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Log Time
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  );
};

export default JobTimeManagement;