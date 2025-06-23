// recipeService.js - Recipe service functions
import { RecipeAPI } from './recipeApi.js';
import { flaskApiUrl } from '../config/config.js';



// NEW: Function untuk load ML recommendations dari Flask API
export const loadMLRecommendations = async (userId, userPreferences = null) => {
  try {
    let mlData;
    
    // Get auth token (sesuaikan dengan sistem auth Anda)
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication token not found');
    }

    if (userId && userId !== 'new') {
      // Existing user - GET request
      const endpoint = `${flaskApiUrl}/recommendations/existing-user/${userId}`;
      mlData = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!mlData.ok) {
        throw new Error(`HTTP error! status: ${mlData.status}`);
      }
      
      mlData = await mlData.json();
    } else {
      // New user - POST request with preferences
      const endpoint = `${flaskApiUrl}/recommendations/new-user`;
      const requestBody = userPreferences || {
        dietary_restrictions: [],
        preferred_cuisines: ['Indonesian'],
        cooking_time_preference: 'medium',
        difficulty_level: 'beginner'
      };
      
      mlData = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!mlData.ok) {
        throw new Error(`HTTP error! status: ${mlData.status}`);
      }
      
      mlData = await mlData.json();
    }

    // Transform API response to match frontend structure
    return {
      untukKamu: mlData.untuk_kamu || mlData.untukKamu || [],
      preferensiSama: mlData.preferensi_sama || mlData.preferensiSama || [],
      topWerecooked: mlData.top_werecooked || mlData.topWerecooked || []
    };

  } catch (error) {
    console.error('Error loading ML recommendations:', error);
    
    // Fallback: return empty arrays or guest recipes
    return {
      untukKamu: [],
      preferensiSama: [],
      topWerecooked: []
    };
  }
};


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
    console.log('🔍 DEBUG Frontend: Loading recipe detail for ID:', recipeId);
    console.log('🔍 DEBUG Frontend: ID type:', typeof recipeId);
    console.log('🔍 DEBUG Frontend: ID length:', recipeId ? recipeId.length : 'undefined');
    
    // Validasi RecipeAPI
    if (!RecipeAPI || typeof RecipeAPI.getRecipeById !== 'function') {
      console.error('❌ RecipeAPI.getRecipeById is not available!');
      console.log('RecipeAPI object:', RecipeAPI);
      throw new Error('RecipeAPI.getRecipeById is not a function');
    }

    // Bersihkan ID dari karakter yang tidak perlu
    const cleanId = String(recipeId).trim();
    console.log('🔍 DEBUG Frontend: Cleaned ID:', cleanId);

    console.log('🔍 DEBUG Frontend: Calling RecipeAPI.getRecipeById...');
    const response = await RecipeAPI.getRecipeById(cleanId);

    console.log('🔍 DEBUG Frontend: API Response:', response);

    if (!response.error && response.data) {
      console.log('✅ DEBUG Frontend: Recipe loaded successfully');
      return response.data;
    } else {
      console.log('❌ DEBUG Frontend: Recipe not found or error');
      console.log('❌ DEBUG Frontend: Error details:', response);
      throw new Error(response.message || 'Recipe not found');
    }
  } catch (error) {
    console.error('❌ DEBUG Frontend: Error loading recipe detail:', error);
    console.error('❌ DEBUG Frontend: Full error object:', error);
    throw error;
  }
}


// Existing loadGuestRecipes function tetap sama

export default {
  loadCategories,
  searchRecipes,
  loadRecipesByCategory,
  loadGuestRecipes,
  loadRecipeDetail,
  loadMLRecommendations
};


