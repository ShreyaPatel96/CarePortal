import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config/config';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token refresh state management
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

// Function to create a unique key for requests
const createRequestKey = (method: string, url: string, data?: any): string => {
  const dataString = data ? JSON.stringify(data) : '';
  return `${method.toUpperCase()}:${url}:${dataString}`;
};

// Function to process the queue of requests waiting for token refresh
const processQueue = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Function to refresh token
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('careProvider_refreshToken');
    if (!refreshToken) {
      return null;
    }

    const response = await axios.post(`${config.api.baseUrl}/Auth/refresh-token`, {
      refreshToken: refreshToken
    });

    const { token, refreshToken: newRefreshToken } = response.data.data;
    
    // Update tokens in localStorage
    localStorage.setItem('careProvider_token', token);
    localStorage.setItem('careProvider_refreshToken', newRefreshToken);
    
    return token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear all tokens on refresh failure
    localStorage.removeItem('careProvider_token');
    localStorage.removeItem('careProvider_user');
    localStorage.removeItem('careProvider_refreshToken');
    return null;
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('careProvider_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no token is available and this is not an auth endpoint, reject the request
      const isAuthEndpoint = config.url?.includes('/Auth/');
      if (!isAuthEndpoint) {
        console.warn('No authentication token available for request:', config.url);
        // Don't reject here, let the server handle the 401 response
        // This allows the response interceptor to handle token refresh
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized with automatic token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token refresh is already in progress, queue this request
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        if (newToken) {
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Process queued requests
          processQueue(newToken);
          
          // Retry the original request
          return axios(originalRequest);
        } else {
          // Token refresh failed, redirect to login
          window.location.href = '/';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        window.location.href = '/';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('Access forbidden:', error.response.data);
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.warn('Resource not found:', error.config?.url);
    }
    
    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Retry configuration for network errors
const retryConfig = {
  retries: 3,
  retryDelay: (retryCount: number) => {
    return Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
  },
  retryCondition: (error: any) => {
    // Retry on network errors or 5xx server errors
    return (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      (error.response && error.response.status >= 500)
    );
  },
};

// API service class
export class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = apiClient;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('careProvider_token');
    return !!token;
  }

  // Get current token
  getToken(): string | null {
    return localStorage.getItem('careProvider_token');
  }

  // Clear authentication data
  clearAuth(): void {
    localStorage.removeItem('careProvider_token');
    localStorage.removeItem('careProvider_user');
    localStorage.removeItem('careProvider_refreshToken');
  }

  // Generic GET request with retry logic and deduplication
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = createRequestKey('GET', url);
    
    // Check if there's already a pending request
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating GET request: ${url}`);
      return pendingRequests.get(requestKey)!;
    }
    
    // Create new request
    const requestPromise = this.requestWithRetry(() => this.client.get<T>(url, config));
    
    // Store the request promise
    pendingRequests.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(requestKey);
    }
  }

  // Generic POST request with retry logic and deduplication
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = createRequestKey('POST', url, data);
    
    // Check if there's already a pending request
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating POST request: ${url}`);
      return pendingRequests.get(requestKey)!;
    }
    
    // Create new request
    const requestPromise = this.requestWithRetry(() => this.client.post<T>(url, data, config));
    
    // Store the request promise
    pendingRequests.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(requestKey);
    }
  }

  // Generic PUT request with retry logic and deduplication
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = createRequestKey('PUT', url, data);
    
    // Check if there's already a pending request
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating PUT request: ${url}`);
      return pendingRequests.get(requestKey)!;
    }
    
    // Create new request
    const requestPromise = this.requestWithRetry(() => this.client.put<T>(url, data, config));
    
    // Store the request promise
    pendingRequests.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(requestKey);
    }
  }

  // Generic DELETE request with retry logic and deduplication
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = createRequestKey('DELETE', url);
    
    // Check if there's already a pending request
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating DELETE request: ${url}`);
      return pendingRequests.get(requestKey)!;
    }
    
    // Create new request
    const requestPromise = this.requestWithRetry(() => this.client.delete<T>(url, config));
    
    // Store the request promise
    pendingRequests.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(requestKey);
    }
  }

  // Generic PATCH request with retry logic and deduplication
  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = createRequestKey('PATCH', url, data);
    
    // Check if there's already a pending request
    if (pendingRequests.has(requestKey)) {
      console.log(`🔄 Deduplicating PATCH request: ${url}`);
      return pendingRequests.get(requestKey)!;
    }
    
    // Create new request
    const requestPromise = this.requestWithRetry(() => this.client.patch<T>(url, data, config));
    
    // Store the request promise
    pendingRequests.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(requestKey);
    }
  }

  // Retry logic for failed requests
  private async requestWithRetry<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
      try {
        const response = await requestFn();
        return response.data;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry if it's not a retryable error
        if (!retryConfig.retryCondition(error)) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === retryConfig.retries) {
          break;
        }
        
        // Wait before retrying
        const delay = retryConfig.retryDelay(attempt);
        console.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${retryConfig.retries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export the axios client for direct use if needed
export default apiClient; 