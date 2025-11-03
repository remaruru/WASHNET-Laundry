// API Configuration
// This centralizes all API endpoint configuration
// Set REACT_APP_API_URL in .env file (e.g., http://localhost:8000/api or https://yourdomain.com/api)

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    // Authentication
    login: `${API_BASE_URL}/login`,
    register: `${API_BASE_URL}/register`,
    logout: `${API_BASE_URL}/logout`,
    me: `${API_BASE_URL}/me`,
    
    // Orders
    orders: `${API_BASE_URL}/orders`,
    orderSearch: `${API_BASE_URL}/orders/search`,
    orderStatistics: `${API_BASE_URL}/orders/statistics`,
    employeeOverview: `${API_BASE_URL}/orders/employee-overview`,
    
    // Analytics
    analytics: `${API_BASE_URL}/analytics`,
  }
};

export default apiConfig;
