// Configuration file that centralizes all environment variables
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7188/api',
    timeout: 10000,
  },
  
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'CarePortal',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_NODE_ENV || 'development',
  },
  
  // Feature flags
  features: {
    enableDebugMode: import.meta.env.VITE_NODE_ENV === 'development',
  }
};

// Type-safe environment variable access
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`;
};

// Helper function to check if we're in development mode
export const isDevelopment = (): boolean => {
  return config.app.environment === 'development';
};

// Helper function to check if we're in production mode
export const isProduction = (): boolean => {
  return config.app.environment === 'production';
}; 