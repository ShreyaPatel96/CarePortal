import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | null;
  onClear?: () => void;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClear, className = '' }) => {
  if (!error) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 mb-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800">{error}</p>
        </div>
        {onClear && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClear}
              className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay; 