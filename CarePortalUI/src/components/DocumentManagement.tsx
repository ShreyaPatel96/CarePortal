import React, { useState, useEffect } from 'react';
import { useDocument } from '../contexts/DocumentContext';
import { useClient } from '../contexts/ClientContext';
import FileUpload from './FileUpload';
import { FileUploadService } from '../services/fileUploadService';
import { DocumentStatusSummary, Document as DocumentType, documentService } from '../services/documentService';
import { metadataService, MetadataDto } from '../services/metadataService';
import { 
  FileText, 
  Plus, 
  Search, 
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react';

// Notification component
interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 
                  type === 'error' ? 'bg-red-50 border-red-200' : 
                  'bg-blue-50 border-blue-200';
  const textColor = type === 'success' ? 'text-green-800' : 
                   type === 'error' ? 'text-red-800' : 
                   'text-blue-800';
  const iconColor = type === 'success' ? 'text-green-400' : 
                   type === 'error' ? 'text-red-400' : 
                   'text-blue-400';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg ${bgColor}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {type === 'success' && <CheckCircle className={`h-5 w-5 ${iconColor}`} />}
          {type === 'error' && <AlertCircle className={`h-5 w-5 ${iconColor}`} />}
          {type === 'info' && <AlertCircle className={`h-5 w-5 ${iconColor}`} />}
        </div>
        <div className="ml-3">
          <p className={`text-sm font-medium ${textColor}`}>{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={onClose}
            className={`inline-flex ${textColor} hover:opacity-75 focus:outline-none`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const DocumentManagement: React.FC = () => {
  const { documents, documentsTotalCount, addDocument, refreshDocuments } = useDocument();
  const { clients } = useClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [statusSummary, setStatusSummary] = useState<DocumentStatusSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [documentStatuses, setDocumentStatuses] = useState<MetadataDto[]>([]);
  
  // Pagination state - use server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  
  // State for document upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocumentForUpload, setSelectedDocumentForUpload] = useState<DocumentType | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  
  // Notification state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    deadline: '',
    isActive: true
  });

  // Show notification helper
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Auto hide after 5 seconds
  };

  // Load status summary and document statuses on component mount
  useEffect(() => {
    loadDocumentStatuses();
    loadStatusSummary();
    loadDocuments(); // Load documents with current filters
  }, []);

  // Load documents when filters or pagination change
  useEffect(() => {
    loadDocuments();
  }, [currentPage, searchTerm, statusFilter]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      
      // Use server-side pagination and filtering
      // The server should handle search by title, client name, and status filtering
      await refreshDocuments(
        currentPage, 
        recordsPerPage, 
        undefined, // Let server handle client filtering
        statusFilter !== 'all' ? statusFilter : undefined,
        searchTerm.trim() || undefined
      );
      
    } catch (error) {
      console.error('❌ DocumentManagement - Error loading documents:', error);
      showNotification('Failed to load documents. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };



  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Always reset to first page when searching, even if search term is empty
      setCurrentPage(1);
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadDocumentStatuses = async () => {
    try {
      const statuses = await metadataService.getDocumentStatuses();
      setDocumentStatuses(statuses);
    } catch (error) {
      console.error('Error loading document statuses:', error);
    }
  };

  const loadStatusSummary = async () => {
    try {
      const summary = await documentService.getStatusSummary();
      setStatusSummary(summary);
    } catch (error) {
      console.error('Error loading status summary:', error);
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setSearchTerm('');
      setStatusFilter('all');
      setCurrentPage(1);
      
      await Promise.all([
        loadDocumentStatuses(),
        loadStatusSummary(),
        loadDocuments()
      ]);
      
      showNotification('Data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Error refreshing data:', error);
      showNotification('Failed to refresh data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Use server-side pagination data instead of client-side filtering
  const totalRecords = documentsTotalCount;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const currentRecords = documents; // Documents are already filtered by server

  // Pagination calculations
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = Math.min(startIndex + recordsPerPage, totalRecords);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers for pagination
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

  // Handle file selection
  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
  };

  // Handle file removal
  const handleRemoveFile = async () => {
    if (uploadedFileName) {
      try {
        await FileUploadService.deleteDocumentFile(uploadedFileName);
        setUploadedFileName('');
      } catch (error) {
        console.error('Error removing file:', error);
        // Even if deletion fails, clear the local state
        setUploadedFileName('');
      }
    }
  };

  // Handle file download
  const handleDownloadFile = async () => {
    if (uploadedFileName) {
      try {
        await FileUploadService.downloadAndSaveFile(uploadedFileName, 'document');
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  };

  // Handle download for existing documents
  const handleDownloadDocumentFile = async (fileName: string) => {
    try {
      await FileUploadService.downloadAndSaveFile(fileName, 'document');
      showNotification('File downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading file:', error);
      showNotification('Failed to download file. Please try again.', 'error');
    }
  };

  // Handle upload for existing documents
  const handleUploadToExistingDocument = (document: DocumentType) => {
    setSelectedDocumentForUpload(document);
    setShowUploadModal(true);
  };

  // Handle file selection for existing document upload
  const handleUploadFileSelect = (file: File | null) => {
    setUploadFile(file);
  };

  // Load existing files for selected client when upload modal opens
  const loadExistingFilesForClient = (clientId: number) => {
    // Filter documents for the selected client that have files
    documents.filter(doc => doc.clientId === clientId && doc.fileName);
  };

  // Handle client selection in upload modal
  const handleClientSelection = (clientId: string) => {
    setFormData({...formData, clientId});
    if (clientId) {
      loadExistingFilesForClient(parseInt(clientId));
    } else {
    }
  };

  // Handle upload submission for existing document
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDocumentForUpload || !uploadFile || isUploading) {
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload the file first using FileController
      const uploadResponse = await FileUploadService.uploadDocumentFile(uploadFile);
      
      // Update the document with the file information
      await documentService.updateDocument(selectedDocumentForUpload.id, {
        fileName: uploadResponse.fileName,
        fileType: uploadResponse.fileType
      });
      
      // Close modal and reset state
      setShowUploadModal(false);
      setSelectedDocumentForUpload(null);
      setUploadFile(null);
      
      // Show success notification
      showNotification('File uploaded successfully!', 'success');
      
      // Refresh documents list with current pagination and filters
      await refreshDocuments(
        currentPage, 
        recordsPerPage, 
        undefined, // Let server handle client filtering
        statusFilter !== 'all' ? statusFilter : undefined,
        searchTerm || undefined
      );
      
      // Also refresh status summary to update stats cards
      await loadStatusSummary();
      
    } catch (error) {
      console.error('Error uploading file to document:', error);
      showNotification('Failed to upload file. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Upload file first if selected
      let fileName = '';
      let fileType = '';
      if (selectedFile) {
        try {
          const uploadResponse = await FileUploadService.uploadDocumentFile(selectedFile);
          fileName = uploadResponse.fileName;
          fileType = uploadResponse.fileType;
          setUploadedFileName(uploadResponse.fileName);
        } catch (error) {
          console.error('Error uploading file:', error);
          showNotification('Failed to upload file. Please try again.', 'error');
          setIsSubmitting(false);
          return;
        }
      }

      // Create document with file information
      const documentData = {
        clientId: parseInt(formData.clientId) || 0,
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline,
        isActive: formData.isActive,
        fileName: fileName || undefined,
        fileType: fileType || undefined
      };

      await addDocument(documentData);

      if (fileName) {
        showNotification('Document created and file uploaded successfully!', 'success');
      } else {
        showNotification('Document created successfully!', 'success');
      }

      setShowModal(false);
      resetForm();
      
      // Go to first page to see the newly added document
      setCurrentPage(1);
      await refreshDocuments(
        1, // Always go to first page after adding
        recordsPerPage, 
        undefined, // Let server handle client filtering
        statusFilter !== 'all' ? statusFilter : undefined,
        searchTerm || undefined
      );

      await loadStatusSummary();
    } catch (error) {
      console.error('Error creating document:', error);
      showNotification('Failed to create document. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      title: '',
      description: '',
      deadline: '',
      isActive: true
    });
    setSelectedFile(null);
    setUploadedFileName('');
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'upload':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'overdue':
        return <AlertCircle className="text-red-500" size={16} />;
      case 'pending':
        return <Clock className="text-orange-500" size={16} />;
      default:
        return <Clock className="text-orange-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'upload':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getStatusDescription = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'Document is pending upload (deadline in future or today without file)';
      case 'upload':
        return 'Document has been uploaded successfully (deadline is today)';
      case 'overdue':
        return 'Document is past deadline and needs upload';
      default:
        return 'Unknown status';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3" size={28} />
              Document Management
            </h1>
            <p className="text-gray-600 mt-1">Manage client documents and deadlines</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={20} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">
                {statusSummary ? statusSummary.total : documentsTotalCount}
              </p>
            </div>
            <FileText className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uploaded</p>
              <p className="text-2xl font-bold text-green-600">
                {statusSummary ? statusSummary.upload : 0}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {statusSummary ? statusSummary.pending : 0}
              </p>
            </div>
            <Clock className="text-yellow-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {statusSummary ? statusSummary.overdue : 0}
              </p>
            </div>
            <AlertCircle className="text-red-500" size={24} />
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
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              {documentStatuses.map((status) => (
                <option key={status.paramKey} value={status.paramKey.toLowerCase()}>
                  {status.paramValue}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="text-gray-400 mb-4" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Try adjusting your filters to see more results.' 
                          : 'No documents have been created yet.'}
                      </p>
                      {searchTerm || statusFilter !== 'all' ? (
                        <button
                          onClick={handleRefresh}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowModal(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Add First Document
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentRecords.map((document) => {
                  return (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="text-blue-500 mr-3" size={20} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{document.title}</div>
                            <div className="text-sm text-gray-500">{document.fileName || 'No file uploaded'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.clientName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}>
                            {getStatusIcon(document.status)}
                            <span className="ml-1 capitalize">
                              {(() => {
                                // Map backend status to enum display value
                                const docStatus = document.status.toLowerCase();
                                if (docStatus === 'upload') {
                                  return 'Upload';
                                }
                                return documentStatuses.find(s => s.paramKey.toLowerCase() === docStatus)?.paramValue || document.status.replace('_', ' ');
                              })()}
                            </span>
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {getStatusDescription(document.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {new Date(document.deadline).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="font-medium">By:</span>
                            <span className="ml-1">{document.uploadedBy || 'Not uploaded'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {document.fileName && (
                            <button 
                              onClick={() => handleDownloadDocumentFile(document.fileName)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Download file"
                            >
                              <Download size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleUploadToExistingDocument(document)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title={document.fileName ? "Replace file" : "Upload file"}
                          >
                            <Upload size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination - Only show if there are records */}
      {totalRecords > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {endIndex} of {totalRecords} documents
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100"
                title="First page"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100"
                title="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? goToPage(page) : null}
                  disabled={typeof page !== 'number'}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    typeof page === 'number'
                      ? currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400 cursor-default'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100"
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100"
                title="Last page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Document</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client
                </label>
                  <select
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.clientId}
                        onChange={(e) => handleClientSelection(e.target.value)}
                      >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.firstName} {client.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline (Required)
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
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
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Add Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload File to Existing Document Modal */}
      {showUploadModal && selectedDocumentForUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upload File to Document</h2>
            <p className="text-gray-600 mb-4">
              Upload a file for: <strong>{selectedDocumentForUpload.title}</strong>
            </p>
            
            {/* Show existing file information if document has a file */}
            {selectedDocumentForUpload.fileName && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <FileText className="mr-2" size={16} />
                  Current File
                </h3>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <FileText className="text-blue-500" size={20} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedDocumentForUpload.fileName}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded by: {selectedDocumentForUpload.uploadedBy || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(selectedDocumentForUpload.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleDownloadDocumentFile(selectedDocumentForUpload.fileName)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      title="Download current file"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Uploading a new file will replace the current file. The current file will be permanently deleted.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedDocumentForUpload.fileName ? 'Select New File (Replace Current)' : 'Select File'}
                </label>
                <input
                  type="file"
                  required
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleUploadFileSelect(file);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: JPG, PNG, GIF, PDF, DOC, DOCX (Max 50MB)
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedDocumentForUpload(null);
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedDocumentForUpload.fileName 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isUploading ? 'Uploading...' : selectedDocumentForUpload.fileName ? 'Replace File' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default DocumentManagement;