// API Configuration for different environments
const config = {
  development: {
    // If we are on localhost:5173 (Vite), use relative paths for the proxy.
    // Otherwise, default to the local backend port 5000.
    API_BASE_URL: typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '5173'
      ? '' 
      : 'http://localhost:5000'
  },
  production: {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '' // Production Backend URL
  }
};

// Determine current environment
const environment = import.meta.env.MODE || 'development';

// Export the current configuration
export const API_CONFIG = config[environment];

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  GOOGLE_AUTH: '/api/auth/google',
  
  // Issues endpoints
  ISSUES: '/api/issues',
  ISSUE_BY_ID: (id) => `/api/issues/${id}`,
  UPVOTE_ISSUE: (id) => `/api/issues/${id}/upvote`,
  DOWNVOTE_ISSUE: (id) => `/api/issues/${id}/downvote`,
  REPORT_ISSUE: (id) => `/api/issues/${id}/report`,
  COMMENT_ISSUE: (id) => `/api/issues/${id}/comment`,
  UPDATE_ISSUE_STATUS: (id) => `/api/issues/${id}/status`,
  VALIDATE_IMAGE: '/api/issues/validate-image',
  
  // AI Assistant endpoint
  AI_CHAT: '/api/ai/chat',
  
  // Admin endpoints
  ADMIN_ISSUES: '/api/admin/issues',
  
  // Categories endpoint
  CATEGORIES: '/api/categories'
};

// Helper function to build full URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.API_BASE_URL}${endpoint}`;
};

// HTTP methods helper
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  
  const response = await fetch(buildApiUrl(endpoint), config);
  return response.json();
};
