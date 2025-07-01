import { apiService } from './api';
import { config } from '../config/config';

export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
  originalFileName: string;
  fileSize: number;
  fileType: string;
}

export interface FileInfo {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  lastModified: string;
}

export class FileUploadService {
  // Upload a file to the server
  static async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiService.post<FileUploadResponse>('/File/upload/document', formData, {
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
  static async uploadDocumentFile(file: File): Promise<{ fileName: string; fileUrl: string; originalFileName: string; fileSize: number; fileType: string }> {
    const formData = new FormData();
    formData.append('File', file);

    try {
      const response = await apiService.post<{ fileName: string; fileUrl: string; originalFileName: string; fileSize: number; fileType: string }>('/File/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error uploading document file:', error);
      throw new Error('Failed to upload document file');
    }
  }

  // Upload a general file (for incidents)
  static async uploadFileGeneral(file: File): Promise<{ fileName: string; fileUrl: string; originalFileName: string; fileSize: number; fileType: string }> {
    const formData = new FormData();
    formData.append('File', file);

    try {
      const response = await apiService.post<{ fileName: string; fileUrl: string; originalFileName: string; fileSize: number; fileType: string }>('/File/upload/incident', formData, {
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

  // Download a file
  static async downloadFile(fileName: string): Promise<Blob> {
    try {
      const response = await apiService.get(`/File/download/${fileName}`, {
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
    try {
      const response = await apiService.get(`/File/download/document/${fileName}`, {
        responseType: 'blob',
      }) as Blob;
      return response;
    } catch (error) {
      console.error('Error downloading document file:', error);
      throw new Error('Failed to download document file');
    }
  }

  // Get file information
  static async getFileInfo(fileName: string): Promise<FileInfo> {
    try {
      const response = await apiService.get<FileInfo>(`/File/info/${fileName}`);
      return response;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new Error('Failed to get file information');
    }
  }

  // Delete a file
  static async deleteFile(fileName: string, isDocument: boolean = false): Promise<void> {
    try {
      const endpoint = isDocument ? `/File/document/${fileName}` : `/File/incident/${fileName}`;
      await apiService.delete(endpoint);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  // Download and save file to local system
  static async downloadAndSaveFile(fileName: string, isDocument: boolean = false): Promise<void> {
    try {
      const blob = isDocument 
        ? await this.downloadDocumentFile(fileName)
        : await this.downloadFile(fileName);
      
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
  static getFileUrl(fileName: string, isDocument: boolean = false): string {
    const basePath = isDocument ? '/uploads/documents' : '/uploads/incidents';
    return `${config.api.baseUrl}${basePath}/${fileName}`;
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