// RecipeAPI.js - Recipe API service class
import { publicApiGet } from './httpClient.js';

export class RecipeAPI {
  // Get all recipes with optional parameters
  static async getAllRecipes(params = {}) {
    const { search, page = 1, limit = 50, category } = params;
    
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (category) queryParams.append('category', category);
    
    const endpoint = `/api/recipes${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await publicApiGet(endpoint);
  }

  // Get recipe by ID - FIXED
    static async getRecipeById(id) {
    try {
      const response = await publicApiGet(`/api/recipes/${id}`);
      return response;
    } catch (error) {
      console.error('❌ API: Error getting recipe by ID:', error);
      throw error;
    }
  }

  // Get all categories
  static async getCategories() {
    return await publicApiGet('/api/categories');
  }

  // Get recipes by category
  static async getRecipesByCategory(category, params = {}) {
    const { page = 1, limit = 12 } = params;
    
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    const endpoint = `/api/recipes/category/${category}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await publicApiGet(endpoint);
  }

  // Guest endpoints
  static async getTopMenuHemat() {
    return await publicApiGet('/api/guest/top-menu-hemat');
  }

  static async getTopAndalan() {
    return await publicApiGet('/api/guest/top-andalan');
  }

  static async getBanyakDisukai() {
    return await publicApiGet('/api/guest/banyak-disukai');
  }
}

export default RecipeAPI;