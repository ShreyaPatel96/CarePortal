import React, { useState, useRef } from 'react';
import { Upload, X, File, Image, FileText, Download, Trash2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  uploadedFileName?: string;
  onRemoveFile?: () => void;
  onDownloadFile?: () => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  uploadedFileName,
  onRemoveFile,
  onDownloadFile,
  acceptedTypes = ".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx",
  maxSizeMB = 50
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        return;
      }
      onFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        return;
      }
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-8 h-8 text-blue-500" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-600" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      {!selectedFile && !uploadedFileName && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedTypes}
            onChange={handleFileChange}
          />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop your file here, or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX (Max {maxSizeMB}MB)
          </p>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile.name)}
              <div>
                <p className="font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onFileSelect(null)}
                className="text-gray-400 hover:text-red-500 p-1"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded File Display */}
      {uploadedFileName && !selectedFile && (
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(uploadedFileName)}
              <div>
                <p className="font-medium text-gray-900">{uploadedFileName}</p>
                <p className="text-sm text-green-600">File uploaded successfully</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {onDownloadFile && (
                <button
                  onClick={onDownloadFile}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Download file"
                >
                  <Download size={16} />
                </button>
              )}
              {onRemoveFile && (
                <button
                  onClick={onRemoveFile}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 