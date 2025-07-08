import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { documentService, Document, CreateDocumentRequest, UpdateDocumentRequest } from '../services/documentService';
import { ErrorHandler } from '../utils/errorHandler';
import { IDocumentContext } from './interfaces/IDocumentContext';

interface DocumentProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

const DocumentContext = createContext<IDocumentContext | undefined>(undefined);

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
};

// Helper function to handle API errors
const handleApiError = (error: any, operation: string): string => {
  return ErrorHandler.extractErrorMessage(error, operation);
};

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children, isAuthenticated }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsTotalCount, setDocumentsTotalCount] = useState(0);
  const [documentsPageNumber, setDocumentsPageNumber] = useState(1);
  const [documentsPageSize, setDocumentsPageSize] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    loading: false,
    operation: false
  });

  const documentsLoadingRef = useRef(false);

  // Load initial data only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshDocuments();
    } else {
      setDocuments([]);
      setDocumentsTotalCount(0);
      setError(null);
    }
  }, [isAuthenticated]);

  // Document operations with optimistic updates
  const refreshDocuments = useCallback(async (pageNumber = 1, pageSize = 10, clientId?: number, status?: string, search?: string) => {
    if (documentsLoadingRef.current) {
      return;
    }
    
    documentsLoadingRef.current = true;
    setLoadingStates(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await documentService.getDocuments(pageNumber, pageSize, clientId, status, search);
      setDocuments(response.documents);
      setDocumentsTotalCount(response.totalCount);
      setDocumentsPageNumber(response.pageNumber);
      setDocumentsPageSize(response.pageSize);
    } catch (err) {
      const errorMessage = handleApiError(err, 'documents');
      console.error('❌ DocumentContext - Failed to load documents:', err);
      setError(errorMessage);
    } finally {
      documentsLoadingRef.current = false;
      setLoadingStates(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const addDocument = async (document: CreateDocumentRequest): Promise<Document> => {
    if (loadingStates.operation) {
      throw new Error('Operation in progress');
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      const newDocument = await documentService.createDocument(document);
      
      setDocuments(prev => [newDocument, ...prev]);
      setDocumentsTotalCount(prev => prev + 1);
      
      return newDocument;
    } catch (err) {
      const errorMessage = handleApiError(err, 'add document');
      setError(errorMessage);
      console.error('❌ DocumentContext - Failed to add document:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const updateDocument = async (id: number, document: UpdateDocumentRequest) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    try {
      setDocuments(prev => prev.map(d => 
        d.id === id 
          ? { ...d, ...document, updatedAt: new Date().toISOString() }
          : d
      ));
      
      await documentService.updateDocument(id, document);
    } catch (err) {
      // Revert optimistic update on error
      await refreshDocuments(documentsPageNumber, documentsPageSize);
      
      const errorMessage = handleApiError(err, 'update document');
      setError(errorMessage);
      console.error('❌ DocumentContext - Failed to update document:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const deleteDocument = async (id: number) => {
    if (loadingStates.operation) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, operation: true }));
    
    const documentToDelete = documents.find(d => d.id === id);
    
    try {
      setDocuments(prev => prev.filter(d => d.id !== id));
      setDocumentsTotalCount(prev => prev - 1);
      
      await documentService.deleteDocument(id);
    } catch (err) {
      if (documentToDelete) {
        setDocuments(prev => [...prev, documentToDelete]);
        setDocumentsTotalCount(prev => prev + 1);
      }
      
      const errorMessage = handleApiError(err, 'delete document');
      setError(errorMessage);
      console.error('❌ DocumentContext - Failed to delete document:', err);
      throw new Error(errorMessage);
    } finally {
      setLoadingStates(prev => ({ ...prev, operation: false }));
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: IDocumentContext = {
    documents,
    documentsTotalCount,
    documentsPageNumber,
    documentsPageSize,
    loading: loadingStates.loading || loadingStates.operation,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    refreshDocuments,
    clearError,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}; 