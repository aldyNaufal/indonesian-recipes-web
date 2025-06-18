// api.js - Fixed version untuk production dengan domain
// Konfigurasi base URL - FIXED VERSION
const getBaseUrl = () => {
  // Untuk development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000'; // URL lengkap backend development
  }
  
  // Untuk production - menggunakan domain yang sama
  return `${window.location.protocol}//${window.location.host}`;
};

const baseUrl = getBaseUrl();

// Helper function untuk handle response
const handleResponse = async (response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    } catch (parseError) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

// Generic API function - FIXED
export async function apiRequest(endpoint, options = {}) {
  try {
    let url;
    
    if (endpoint.startsWith('http')) {
      // URL absolut
      url = endpoint;
    } else {
      // Pastikan endpoint dimulai dengan /api
      const cleanEndpoint = endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`;
      url = `${baseUrl}${cleanEndpoint}`;
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
    console.log('Environment:', window.location.hostname);
    console.log('Base URL:', baseUrl);
    
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
// =================================================================
// RECIPE API SERVICE - FIXED untuk konsistensi dengan backend
// =================================================================
export class RecipeAPI {
  // Get all recipes with optional parameters
  static async getAllRecipes(params = {}) {
    const { search, page = 1, limit = 50, category } = params;
    
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (category) queryParams.append('category', category);
    
    // PERBAIKAN: Konsisten dengan backend route /api/recipes
    const endpoint = `/api/recipes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await publicApiGet(endpoint);
  }

  // Get recipe by ID
  static async getRecipeById(id) {
    // PERBAIKAN: Konsisten dengan backend route /api/recipes/{id}
    return await publicApiGet(`/api/recipes/${id}`);
  }

  // Get all categories
  static async getCategories() {
    // PERBAIKAN: Konsisten dengan backend route /api/categories
    return await publicApiGet('/api/categories');
  }

  // Get recipes by category
  static async getRecipesByCategory(category, params = {}) {
    const { page = 1, limit = 12 } = params;
    
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    // PERBAIKAN: Konsisten dengan backend route /api/recipes/category/{category}
    const endpoint = `/api/recipes/category/${category}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await publicApiGet(endpoint);
  }

  // Guest endpoints - FIXED
  static async getTopMenuHemat() {
    // PERBAIKAN: Konsisten dengan backend route /api/guest/top-menu-hemat
    return await publicApiGet('/api/guest/top-menu-hemat');
  }

  static async getTopAndalan() {
    // PERBAIKAN: Konsisten dengan backend route /api/guest/top-andalan
    return await publicApiGet('/api/guest/top-andalan');
  }

  static async getBanyakDisukai() {
    // PERBAIKAN: Konsisten dengan backend route /api/guest/banyak-disukai
    return await publicApiGet('/api/guest/banyak-disukai');
  }
}

// =================================================================
// USAGE EXAMPLES - Updated
// =================================================================
export async function loadCategories() {
  try {
    console.log('Loading categories...');
    const response = await RecipeAPI.getCategories();
    
    console.log('Categories response:', response);
    
    if (!response.error && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Failed to load categories');
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    throw error;
  }
}

export async function searchRecipes(searchTerm, page = 1) {
  try {
    console.log('Searching recipes for:', searchTerm);
    const response = await RecipeAPI.getAllRecipes({
      search: searchTerm,
      page: page,
      limit: 20
    });
    
    console.log('Search response:', response);
    
    if (!response.error && response.data) {
      return {
        recipes: response.data,
        pagination: response.pagination
      };
    } else {
      throw new Error(response.message || 'Search failed');
    }
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
}

export async function loadRecipesByCategory(category, page = 1) {
  try {
    console.log('Loading recipes for category:', category);
    const response = await RecipeAPI.getRecipesByCategory(category, {
      page: page,
      limit: 12
    });
    
    console.log('Category recipes response:', response);
    
    if (!response.error && response.data) {
      return {
        recipes: response.data,
        pagination: response.pagination,
        category: response.category
      };
    } else {
      throw new Error(response.message || 'Failed to load category recipes');
    }
  } catch (error) {
    console.error('Error loading category recipes:', error);
    throw error;
  }
}

export async function loadGuestRecipes() {
  try {
    console.log('Loading guest recipes...');
    
    const [topMenuHemat, topAndalan, banyakDisukai] = await Promise.allSettled([
      RecipeAPI.getTopMenuHemat(),
      RecipeAPI.getTopAndalan(),
      RecipeAPI.getBanyakDisukai()
    ]);
    
    const result = {};
    
    if (topMenuHemat.status === 'fulfilled' && !topMenuHemat.value.error) {
      result.topMenuHemat = topMenuHemat.value.data;
    }
    
    if (topAndalan.status === 'fulfilled' && !topAndalan.value.error) {
      result.topAndalan = topAndalan.value.data;
    }
    
    if (banyakDisukai.status === 'fulfilled' && !banyakDisukai.value.error) {
      result.banyakDisukai = banyakDisukai.value.data;
    }
    
    console.log('Guest recipes loaded:', result);
    return result;
  } catch (error) {
    console.error('Error loading guest recipes:', error);
    throw error;
  }
}

export async function loadRecipeDetail(recipeId) {
  try {
    console.log('Loading recipe detail for ID:', recipeId);
    const response = await RecipeAPI.getRecipeById(recipeId);
    
    console.log('Recipe detail response:', response);
    
    if (!response.error && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Recipe not found');
    }
  } catch (error) {
    console.error('Error loading recipe detail:', error);
    throw error;
  }
}

// =================================================================
// TEST FUNCTIONS - FIXED
// =================================================================
export async function testConnection() {
  try {
    console.log('Testing connection to backend...');
    console.log('Base URL:', baseUrl);
    
    // PERBAIKAN: Gunakan endpoint yang konsisten dengan backend
    const response = await publicApiGet('/api/categories');
    console.log('Connection test successful:', response);
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

export async function debugAllEndpoints() {
  const endpoints = [
    '/api/categories',
    '/api/guest/top-menu-hemat',
    '/api/guest/top-andalan',
    '/api/guest/banyak-disukai',
    '/api/recipes?limit=5'
  ];
  
  console.log('Testing all endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      const response = await publicApiGet(endpoint);
      console.log(`✅ ${endpoint}:`, response);
    } catch (error) {
      console.error(`❌ ${endpoint}:`, error);
    }
  }
}

export async function checkBackendHealth() {
  try {
    // PERBAIKAN: Gunakan endpoint yang konsisten
    const response = await fetch(`${baseUrl}/api/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Backend health check:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}

export default {
  RecipeAPI,
  loadCategories,
  searchRecipes,
  loadRecipesByCategory,
  loadGuestRecipes,
  loadRecipeDetail,
  testConnection,
  debugAllEndpoints,
  checkBackendHealth
};