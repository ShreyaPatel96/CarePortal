// Common error handling utilities to eliminate duplicate code

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export class ErrorHandler {
  /**
   * Extract error message from various error response formats
   */
  static extractErrorMessage(error: any, operation: string = 'Operation'): string {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      // Try to extract error message from different possible response formats
      let message = 'Unknown error';
      
      if (data?.error?.message) {
        // Format: { error: { message: "...", statusCode: ... } }
        message = data.error.message;
      } else if (data?.message) {
        // Format: { message: "..." }
        message = data.message;
      } else if (data?.title) {
        // Format: { title: "..." }
        message = data.title;
      } else if (typeof data === 'string') {
        // Direct string response
        message = data;
      }
      
      // Handle validation errors specifically
      if (status === 400 && data?.errors) {
        // Format: { errors: { field: ["error message"] } }
        const validationErrors = Object.entries(data.errors)
          .map(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${messageArray.join(', ')}`;
          })
          .join('; ');
        
        if (validationErrors) {
          return `Validation errors: ${validationErrors}`;
        }
      }
      
      // Handle InvalidOperationException with password validation errors
      if (status === 400 && message.includes('Failed to create user:') && message.includes('Passwords must')) {
        // Extract password validation errors from the message
        const passwordErrors = message.replace('Failed to create user: ', '');
        return `Password validation failed: ${passwordErrors}`;
      }
      
      // Handle specific HTTP status codes
      switch (status) {
        case 401:
          return 'Authentication required. Please log in again.';
        case 403:
          return 'Access denied. You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'Conflict: The resource already exists or has been modified.';
        case 422:
          return 'Validation failed. Please check your input and try again.';
        case 500:
          return 'Server error. Please try again later.';
        case 502:
        case 503:
        case 504:
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return message || `Request failed with status ${status}`;
      }
    }
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timed out. Please try again.';
    }
    
    // Handle generic errors
    if (error.message) {
      return error.message;
    }
    
    return `${operation} failed. Please try again.`;
  }

  /**
   * Create a standardized error object
   */
  static createError(message: string, status?: number, errors?: Record<string, string[]>): ApiError {
    return {
      message,
      status,
      errors
    };
  }

  /**
   * Handle common error scenarios
   */
  static handleError(error: any, operation: string = 'Operation'): ApiError {
    const message = this.extractErrorMessage(error, operation);
    const status = error.response?.status;
    const errors = error.response?.data?.errors;
    
    return this.createError(message, status, errors);
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: any): boolean {
    return error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthError(error: any): boolean {
    return error.response?.status === 401;
  }

  /**
   * Check if error is a permission error
   */
  static isPermissionError(error: any): boolean {
    return error.response?.status === 403;
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: any): boolean {
    return error.response?.status === 400 || error.response?.status === 422;
  }

  /**
   * Check if error is a server error
   */
  static isServerError(error: any): boolean {
    return error.response?.status >= 500;
  }

  /**
   * Get validation errors as a flat array
   */
  static getValidationErrors(error: any): string[] {
    if (!this.isValidationError(error)) {
      return [];
    }

    const errors = error.response?.data?.errors;
    if (!errors) {
      return [];
    }

    return Object.entries(errors)
      .flatMap(([field, messages]) => {
        const messageArray = Array.isArray(messages) ? messages : [messages];
        return messageArray.map(msg => `${field}: ${msg}`);
      });
  }
} 