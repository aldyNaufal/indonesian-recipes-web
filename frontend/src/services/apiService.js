// services/apiService.js
// Fixed API service yang kompatibel dengan browser environment

// Base configuration dengan fallback untuk browser
const API_CONFIG = {
  baseUrl: (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || '/api',
  timeout: 10000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  }
};

// Generic API utilities
class ApiUtilities {
  static async makeRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: { ...API_CONFIG.defaultHeaders },
      timeout: API_CONFIG.timeout,
      ...options,
      headers: {
        ...API_CONFIG.defaultHeaders,
        ...options.headers
      }
    };

    console.log(`API Request: ${config.method} ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleError(response, endpoint);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`Expected JSON but received ${contentType || 'unknown content type'}`);
      }

      const data = await response.json();
      console.log(`API Success: ${config.method} ${url}`, data);
      
      return data;
    } catch (error) {
      console.error(`API Error: ${config.method} ${url}`, error);
      throw this.formatError(error, endpoint);
    }
  }

  static async handleError(response, endpoint) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorText = await response.text();
      
      if (errorText.includes('<!DOCTYPE html>')) {
        errorMessage = `Endpoint ${endpoint} not found or server error`;
      } else {
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
    } catch {
      // Fallback to default error message
    }
    
    throw new Error(errorMessage);
  }

  static formatError(error, endpoint) {
    if (error.name === 'AbortError') {
      return new Error(`Request timeout for ${endpoint}`);
    }
    return error;
  }
}

// Main API Service Class
class ApiService {
  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  // Generic HTTP methods
  async get(endpoint, token = null) {
    return ApiUtilities.makeRequest(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  async post(endpoint, data, token = null) {
    return ApiUtilities.makeRequest(endpoint, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data, token = null) {
    return ApiUtilities.makeRequest(endpoint, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint, token) {
    return ApiUtilities.makeRequest(endpoint, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // ====== PUBLIC ENDPOINTS (No Auth Required) ======
  
  // Categories
  async getCategories() {
    return this.get('/categories');
  }

  // Guest recipe endpoints - Fixed endpoint paths
  async getTopMenuHemat() {
    return this.get('/recipes/guest/top-menu-hemat');
  }

  async getBanyakDisukai() {
    return this.get('/recipes/guest/banyak-disukai');
  }

  async getTopAndalan() {
    return this.get('/recipes/guest/top-andalan');
  }

  // Recipe endpoints
  async getAllRecipes() {
    return this.get('/recipes');
  }

  async getRecipeById(id) {
    return this.get(`/recipes/${id}`);
  }

  async getRecipesByCategory(category) {
    return this.get(`/recipes/category/${category}`);
  }

  // ====== AUTHENTICATED ENDPOINTS ======
  
  // User-specific recipe endpoints (require token)
  async getUntukKamu(token) {
    return this.get('/user/recipes/untuk-kamu', token);
  }

  async getPreferensiSama(token) {
    return this.get('/user/recipes/preferensi-sama', token);
  }

  async getTopWerecooked(token) {
    return this.get('/user/recipes/top-werecooked', token);
  }

  // ====== UTILITY METHODS ======
  
  // Test endpoint connectivity
  async testEndpoint(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      return {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        contentType,
        isJson: contentType?.includes('application/json'),
        isHtml: text.includes('<!DOCTYPE html>'),
        success: response.ok
      };
    } catch (error) {
      return {
        endpoint,
        error: error.message,
        success: false
      };
    }
  }

  // Test all public endpoints
  async testAllPublicEndpoints() {
    const publicEndpoints = [
      '/categories',
      '/recipes/guest/top-menu-hemat',
      '/recipes/guest/banyak-disukai',
      '/recipes/guest/top-andalan',
      '/recipes'
    ];

    console.log('Testing all public endpoints...');
    const results = {};

    for (const endpoint of publicEndpoints) {
      results[endpoint] = await this.testEndpoint(endpoint);
    }

    return results;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return {
        status: response.status,
        healthy: response.ok,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export both the instance and individual functions for flexibility
export default apiService;

// Named exports for direct function calls (backward compatibility)
export const {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete
} = apiService;

// Public API shortcuts (no auth required)
export const publicApi = {
  getCategories: () => apiService.getCategories(),
  getTopMenuHemat: () => apiService.getTopMenuHemat(),
  getBanyakDisukai: () => apiService.getBanyakDisukai(),
  getTopAndalan: () => apiService.getTopAndalan(),
  getAllRecipes: () => apiService.getAllRecipes(),
  getRecipeById: (id) => apiService.getRecipeById(id),
  getRecipesByCategory: (category) => apiService.getRecipesByCategory(category)
};

// Authenticated API shortcuts
export const authApi = {
  getUntukKamu: (token) => apiService.getUntukKamu(token),
  getPreferensiSama: (token) => apiService.getPreferensiSama(token),
  getTopWerecooked: (token) => apiService.getTopWerecooked(token)
};

// Development utilities
export const devUtils = {
  testEndpoint: (endpoint) => apiService.testEndpoint(endpoint),
  testAllPublicEndpoints: () => apiService.testAllPublicEndpoints(),
  healthCheck: () => apiService.healthCheck()
};

// Environment detection utility
export const getEnvironmentInfo = () => {
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('dev'));

  return {
    isDevelopment,
    baseUrl: API_CONFIG.baseUrl,
    currentUrl: typeof window !== 'undefined' ? window.location.href : 'unknown'
  };
};