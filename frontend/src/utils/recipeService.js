// recipeService.js - Recipe service functions
import { RecipeAPI } from './recipeApi.js';

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

export default {
  loadCategories,
  searchRecipes,
  loadRecipesByCategory,
  loadGuestRecipes,
  loadRecipeDetail
};