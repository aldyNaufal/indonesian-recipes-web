// httpClient.js - HTTP request utilities
import { baseUrl } from '../config/config.js';

export async function handleResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

export async function apiRequest(endpoint, options = {}) {
  try {
    let url;
    
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      const cleanEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      url = baseUrl ? `${baseUrl}${cleanEndpoint}` : cleanEndpoint;
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
    
    console.log('Making API request to:', url);
    console.log('Options:', finalOptions);
    
    const response = await fetch(url, finalOptions);
    return await handleResponse(response);
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// GET request
export async function apiGet(endpoint, token = null) {
  const headers = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return apiRequest(endpoint, {
    method: 'GET',
    headers,
  });
}

// POST request
export async function apiPost(endpoint, data, token = null) {
  const headers = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return apiRequest(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
}

// PUT request
export async function apiPut(endpoint, data, token = null) {
  const headers = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return apiRequest(endpoint, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
}

// DELETE request
export async function apiDelete(endpoint, token) {
  const headers = {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return apiRequest(endpoint, {
    method: 'DELETE',
    headers,
  });
}

// Public API calls
export const publicApiGet = async (endpoint) => {
  return apiGet(endpoint, null);
};

export const publicApiPost = async (endpoint, data) => {
  return apiPost(endpoint, data, null);
};

export default {
  handleResponse,
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  publicApiGet,
  publicApiPost
};