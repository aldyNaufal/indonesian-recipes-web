// httpClient.js - HTTP request utilities with Flask API support
import { baseUrl, flaskApiUrl } from '../config/config.js';

export async function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function apiRequest(endpoint, options = {}, useFlaskApi = false) {
  try {
    let url;
    
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const apiBaseUrl = useFlaskApi ? flaskApiUrl : baseUrl;
      url = apiBaseUrl ? `${apiBaseUrl}${cleanEndpoint}` : cleanEndpoint;
    }
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };
    
    console.log(`Making ${useFlaskApi ? 'Flask' : 'API'} request to:`, url);
    console.log('Options:', finalOptions);
    
    const response = await fetch(url, finalOptions);
    return await handleResponse(response);
  } catch (error) {
    console.error(`${useFlaskApi ? 'Flask' : 'API'} Request Error:`, error);
    throw error;
  }
}

// Helper function to get token
function getAuthHeaders(token = null) {
  const headers = {};
  
  // Prioritas: parameter token > localStorage
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    const savedToken = localStorage.getItem('token');
    if (savedToken && savedToken !== 'null' && savedToken !== 'undefined') {
      headers.Authorization = `Bearer ${savedToken}`;
    }
  }
  
  return headers;
}

// Regular API requests (Node.js/Express backend)
export async function apiGet(endpoint, token = null) {
  return apiRequest(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(token),
  }, false);
}

export async function apiPost(endpoint, data, token = null) {
  return apiRequest(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  }, false);
}

export async function apiPut(endpoint, data, token = null) {
  return apiRequest(endpoint, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  }, false);
}

export async function apiDelete(endpoint, token = null) {
  return apiRequest(endpoint, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  }, false);
}

// Flask API requests (Python/Flask ML backend)
export async function flaskApiGet(endpoint, token = null) {
  return apiRequest(endpoint, {
    method: 'GET',
    headers: getAuthHeaders(token),
  }, true);
}

export async function flaskApiPost(endpoint, data, token = null) {
  return apiRequest(endpoint, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  }, true);
}

export async function flaskApiPut(endpoint, data, token = null) {
  return apiRequest(endpoint, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  }, true);
}

export async function flaskApiDelete(endpoint, token = null) {
  return apiRequest(endpoint, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  }, true);
}

// Public API calls (without authentication)
export const publicApiGet = async (endpoint) => {
  return apiGet(endpoint, null);
};

export const publicApiPost = async (endpoint, data) => {
  return apiPost(endpoint, data, null);
};

// Public Flask API calls (without authentication)
export const publicFlaskApiGet = async (endpoint) => {
  return flaskApiGet(endpoint, null);
};

export const publicFlaskApiPost = async (endpoint, data) => {
  return flaskApiPost(endpoint, data, null);
};

// Convenience functions for ML API endpoints
export const mlApi = {
  // Health check
  healthCheck: async () => {
    return publicFlaskApiGet('/health');
  },
  
  // Get recommendations for existing user
  getExistingUserRecommendations: async (userId, topK = 10) => {
    return publicFlaskApiPost('/recommendation/existing-user', {
      user_id: userId,
      top_k: topK
    });
  },
  
  // Get recommendations for new user based on preferences
  getNewUserRecommendations: async (preferences, topK = 10) => {
    return publicFlaskApiPost('/recommendation/new-user', {
      preferences: preferences,
      top_k: topK
    });
  },
  
  // Save user preferences
  savePreferences: async (userId, preferences, token = null) => {
    return flaskApiPost('/preferences', {
      user_id: userId,
      preferences: preferences
    }, token);
  },
  
  // Get user preferences
  getPreferences: async (userId, token = null) => {
    return flaskApiGet(`/preferences/${userId}`, token);
  }
};

export default {
  handleResponse,
  apiRequest,
  // Regular API methods
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  // Flask API methods
  flaskApiGet,
  flaskApiPost,
  flaskApiPut,
  flaskApiDelete,
  // Public methods
  publicApiGet,
  publicApiPost,
  publicFlaskApiGet,
  publicFlaskApiPost,
  // ML API convenience methods
  mlApi
};