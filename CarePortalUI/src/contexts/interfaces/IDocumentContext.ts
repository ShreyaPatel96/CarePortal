import { Document, CreateDocumentRequest, UpdateDocumentRequest } from '../../services/documentService';

export interface IDocumentContext {
  documents: Document[];
  documentsTotalCount: number;
  documentsPageNumber: number;
  documentsPageSize: number;
  loading: boolean;
  error: string | null;
  
  // Document operations
  addDocument: (document: CreateDocumentRequest) => Promise<Document>;
  updateDocument: (id: number, document: UpdateDocumentRequest) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  refreshDocuments: (pageNumber?: number, pageSize?: number, clientId?: number, status?: string, search?: string) => Promise<void>;
  
  // Error handling
  clearError: () => void;
} 