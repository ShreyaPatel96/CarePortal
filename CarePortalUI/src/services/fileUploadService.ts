import { apiService } from './api';

export interface FileUploadResponse {
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  uploadType: string;
  createdAt: string;
  lastModified: string;
}

export interface FileInfo {
  fileName: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
  uploadType: string;
  createdAt: string;
  lastModified: string;
}

export class FileUploadService {
  // Upload a file to the server with upload type
  static async uploadFile(file: File, uploadType: 'document' | 'incident' = 'document'): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiService.post<FileUploadResponse>(`/File/upload?uploadType=${uploadType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Upload a file for documents
  static async uploadDocumentFile(file: File): Promise<FileUploadResponse> {
    return this.uploadFile(file, 'document');
  }

  // Upload a file for incidents
  static async uploadIncidentFile(file: File): Promise<FileUploadResponse> {
    return this.uploadFile(file, 'incident');
  }

  // Download a file with upload type
  static async downloadFile(fileName: string, uploadType: 'document' | 'incident' = 'document'): Promise<Blob> {
    try {
      const response = await apiService.get(`/File/download?fileName=${encodeURIComponent(fileName)}&uploadType=${uploadType}`, {
        responseType: 'blob',
      }) as Blob;
      return response;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error('Failed to download file');
    }
  }

  // Download a document file
  static async downloadDocumentFile(fileName: string): Promise<Blob> {
    return this.downloadFile(fileName, 'document');
  }

  // Download an incident file
  static async downloadIncidentFile(fileName: string): Promise<Blob> {
    return this.downloadFile(fileName, 'incident');
  }

  // Delete a file with upload type
  static async deleteFile(fileName: string, uploadType: 'document' | 'incident' = 'document'): Promise<void> {
    try {
      await apiService.delete(`/File/${encodeURIComponent(fileName)}?uploadType=${uploadType}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Delete a document file
  static async deleteDocumentFile(fileName: string): Promise<void> {
    return this.deleteFile(fileName, 'document');
  }

  // Delete an incident file
  static async deleteIncidentFile(fileName: string): Promise<void> {
    return this.deleteFile(fileName, 'incident');
  }

  // Download and save file to local system
  static async downloadAndSaveFile(fileName: string, uploadType: 'document' | 'incident' = 'document'): Promise<void> {
    try {
      const blob = await this.downloadFile(fileName, uploadType);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading and saving file:', error);
      throw new Error('Failed to download and save file');
    }
  }

  // Get file URL for display
  static getFileUrl(fileName: string, uploadType: 'document' | 'incident' = 'document'): string {
    const basePath = uploadType === 'document' ? '/uploads/documents' : '/uploads/incidents';
    return `${import.meta.env.VITE_API_BASE_URL}${basePath}/${fileName}`;
  }

  // Validate file type
  static isValidFileType(file: File, allowedTypes: string[] = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx']): boolean {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(fileExtension);
  }

  // Validate file size
  static isValidFileSize(file: File, maxSizeMB: number = 50): boolean {
    return file.size <= maxSizeMB * 1024 * 1024;
  }
} 