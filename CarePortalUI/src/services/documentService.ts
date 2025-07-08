import { apiService } from './api';

export interface Document {
  id: number;
  clientId: number;
  clientName: string;
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  uploadedBy: string;
  isActive: boolean;
  deadline: string;
  status: string;
}

export interface DocumentListResponse {
  documents: Document[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateDocumentRequest {
  clientId: number;
  title: string;
  description: string;
  deadline: string;
  isActive?: boolean;
  fileName?: string;
  fileType?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  deadline?: string;
  status?: string;
  isActive?: boolean;
  fileName?: string;
  fileType?: string;
}

export interface UploadDocumentRequest {
  fileName: string;
  fileType: string;
}



export interface DocumentUploadResponse {
  fileName: string;
  fileUrl: string;
  originalFileName: string;
  fileType: string;
}

export interface DocumentStats {
  totalDocuments: number;
  pendingDocuments: number;
  uploadDocuments: number;
  overdueDocuments: number;
}

export interface DocumentStatusSummary {
  total: number;
  pending: number;
  upload: number;
  overdue: number;
}

export class DocumentService {
  // Get all documents with pagination and filters
  async getDocuments(pageNumber: number = 1, pageSize: number = 10, clientId?: number, status?: string, search?: string): Promise<DocumentListResponse> {
    const params = new URLSearchParams();
    params.append('pageNumber', pageNumber.toString());
    params.append('pageSize', pageSize.toString());
    if (clientId) params.append('clientId', clientId.toString());
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    return apiService.get<DocumentListResponse>(`/Document?${params.toString()}`);
  }

  // Get document by ID
  async getDocumentById(id: number): Promise<Document> {
    return apiService.get<Document>(`/Document/${id}`);
  }

  // Create new document
  async createDocument(document: CreateDocumentRequest): Promise<Document> {
    return apiService.post<Document>('/Document', document);
  }

  // Update document
  async updateDocument(id: number, document: UpdateDocumentRequest): Promise<Document> {
    return apiService.put<Document>(`/Document/${id}`, document);
  }



  // Delete document
  async deleteDocument(id: number): Promise<void> {
    return apiService.delete<void>(`/Document/${id}`);
  }

  // Get document status summary
  async getStatusSummary(): Promise<DocumentStatusSummary> {
    return apiService.get<DocumentStatusSummary>('/Document/status-summary');
  }

  // Helper method to determine status based on deadline and file presence with new date logic
  static determineStatus(deadline: string, fileName: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0); // Set to start of day
    
    // If deadline is in the past, status is "overdue"
    if (deadlineDate < today) {
      return 'overdue';
    }
    // If deadline is today and file is uploaded, status is "upload"
    else if (deadlineDate.getTime() === today.getTime() && fileName && fileName.trim() !== '') {
      return 'upload';
    }
    // If deadline is in the future or today without file, status is "pending"
    else {
      return 'pending';
    }
  }
}

export const documentService = new DocumentService(); 