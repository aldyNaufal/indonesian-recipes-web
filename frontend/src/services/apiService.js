// src/services/mlApiService.js

class MLApiService {
  constructor() {
    // Use window.location for browser environment or fallback to defaults
    this.baseURL = this.getEnvVar('REACT_APP_ML_API_URL') || 'http://127.0.0.1:5000';
    this.nodeBaseURL = this.getEnvVar('REACT_APP_NODE_API_URL') || 'http://localhost:3000';
  }

  // Helper method to get environment variables in browser
  getEnvVar(name) {
    // In browser, environment variables are injected at build time
    // They're available as window._env_ or similar, or you can use a config object
    if (typeof window !== 'undefined' && window._env_) {
      return window._env_[name];
    }
    
    // Alternative: check if running in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      // You can define your development URLs here
      const devConfig = {
        'REACT_APP_ML_API_URL': 'http://127.0.0.1:5000',
        'REACT_APP_NODE_API_URL': 'http://localhost:3000'
      };
      return devConfig[name];
    }
    
    return null;
  }

  // Helper method untuk mendapatkan token
  getAuthToken() {
    try {
      const token = localStorage.getItem('token');
      return token; // Return null if no token, don't throw error
    } catch (error) {
      console.warn('Failed to get auth token:', error);
      return null;
    }
  }

  // Helper method untuk membuat request headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Helper method untuk handle response
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        errorData.error || 
        `HTTP ${response.status}: ${response.statusText}`
      );
    }
    return response.json();
  }

  // Health check untuk ML service dengan proper timeout
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased timeout

      const response = await fetch(`${this.baseURL}/api/recommendations/health`, { // Fixed endpoint
        method: 'GET',
        headers: this.getHeaders(false),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return await this.handleResponse(response);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('ML Health check timed out');
        throw new Error('ML service health check timed out');
      }
      console.error('ML Health check failed:', error);
      throw new Error(`ML service is not available: ${error.message}`);
    }
  }

  // Fetch user preferences dari Node.js backend
  async getUserPreferences(userId = null) {
    try {
      // First try to get user ID from token if not provided
      if (!userId) {
        const token = this.getAuthToken();
        if (!token) {
          console.warn('No user ID or token available for preferences');
          return this.getDefaultPreferences();
        }
        // You might need to decode the token to get user ID
        // For now, we'll try the endpoint without user ID
      }

      const endpoint = userId ? `/api/preferences/${userId}` : '/api/preferences';
      const response = await fetch(`${this.nodeBaseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.warn('User preferences endpoint not found, using defaults');
          return this.getDefaultPreferences();
        }
        throw new Error(`Failed to fetch preferences: ${response.status}`);
      }

      const data = await this.handleResponse(response);
      
      return {
        preferred_categories: data.data?.preferred_categories || data.preferred_categories || [],
        preferred_difficulty: data.data?.skill_level || data.preferred_difficulty || "Butuh Usaha",
        top_k: 15,
      };
    } catch (error) {
      console.warn('Failed to fetch user preferences:', error);
      // Return default preferences instead of throwing
      return this.getDefaultPreferences();
    }
  }

  // Get default preferences
  getDefaultPreferences() {
    return {
      preferred_categories: [],
      preferred_difficulty: "Butuh Usaha",
      top_k: 15,
    };
  }

  // Get existing user recommendations
  async getExistingUserRecommendations(userId) {
    try {
      const response = await fetch(
        `${this.baseURL}/recommendation/existing-user`, // Fixed endpoint
        {
          method: 'POST', // Changed to POST as per your httpClient
          headers: this.getHeaders(false), // ML service might not need auth
          body: JSON.stringify({
            user_id: userId,
            top_k: 15
          }),
        }
      );

      const data = await this.handleResponse(response);
      return data.recommendations || data || [];
    } catch (error) {
      console.error('Failed to fetch existing user recommendations:', error);
      throw error;
    }
  }

  // Get new user recommendations based on preferences
  async getNewUserRecommendations(preferences) {
    try {
      // Validate preferences
      const validPreferences = {
        preferred_categories: Array.isArray(preferences.preferred_categories) 
          ? preferences.preferred_categories 
          : [],
        preferred_difficulty: preferences.preferred_difficulty || "Butuh Usaha",
        top_k: Math.min(Math.max(preferences.top_k || 15, 1), 50), // Between 1-50
      };

      const response = await fetch(
        `${this.baseURL}/recommendation/new-user`, // Fixed endpoint
        {
          method: 'POST',
          headers: this.getHeaders(false), // ML service might not need auth
          body: JSON.stringify({
            preferences: validPreferences.preferred_categories,
            top_k: validPreferences.top_k
          }),
        }
      );

      const data = await this.handleResponse(response);
      return data.recommendations || data || [];
    } catch (error) {
      console.error('Failed to fetch new user recommendations:', error);
      throw error;
    }
  }

  // Get comprehensive ML recommendations for a user
  async getAllMLRecommendations(userId) {
    try {
      // Check ML service health first with proper error handling
      let mlServiceAvailable = false;
      try {
        await this.checkHealth();
        mlServiceAvailable = true;
      } catch (healthError) {
        console.warn('ML service not available:', healthError.message);
      }

      // Get user preferences
      const preferences = await this.getUserPreferences(userId);

      const result = {
        existingUser: [],
        newUser: [],
        preferences,
        errors: [],
        mlServiceAvailable
      };

      if (!mlServiceAvailable) {
        result.errors.push('ML service is not available');
        return result;
      }

      // Parallel fetch untuk semua jenis rekomendasi
      const [existingUserRecs, newUserRecs] = await Promise.allSettled([
        this.getExistingUserRecommendations(userId),
        this.getNewUserRecommendations(preferences)
      ]);

      // Process existing user recommendations
      if (existingUserRecs.status === 'fulfilled') {
        result.existingUser = existingUserRecs.value;
      } else {
        result.errors.push(`Existing user recommendations: ${existingUserRecs.reason.message}`);
      }

      // Process new user recommendations
      if (newUserRecs.status === 'fulfilled') {
        result.newUser = newUserRecs.value;
      } else {
        result.errors.push(`New user recommendations: ${newUserRecs.reason.message}`);
      }

      return result;
    } catch (error) {
      console.error('Failed to get ML recommendations:', error);
      // Return a safe fallback instead of throwing
      return {
        existingUser: [],
        newUser: [],
        preferences: this.getDefaultPreferences(),
        errors: [error.message],
        mlServiceAvailable: false
      };
    }
  }

  // Update user interaction (rating, favorite, etc.)
  async updateUserInteraction(recipeId, interactionType, value) {
    try {
      const response = await fetch(
        `${this.baseURL}/interactions`,
        {
          method: 'POST',
          headers: this.getHeaders(false),
          body: JSON.stringify({
            recipe_id: recipeId,
            interaction_type: interactionType, // 'rating', 'favorite', 'view'
            value: value
          }),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to update user interaction:', error);
      throw error;
    }
  }

  // Train model (admin only)
  async trainModel() {
    try {
      const response = await fetch(
        `${this.baseURL}/train`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to train model:', error);
      throw error;
    }
  }

  // Get model metrics
  async getModelMetrics() {
    try {
      const response = await fetch(
        `${this.baseURL}/metrics`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        }
      );

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Failed to get model metrics:', error);
      throw error;
    }
  }

  // Check if ML service is available
  async isMLServiceAvailable() {
    try {
      await this.checkHealth();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Create singleton instance
const mlApiService = new MLApiService();

export default mlApiService;

// Named exports untuk convenience
export const {
  checkHealth,
  getUserPreferences,
  getExistingUserRecommendations,
  getNewUserRecommendations,
  getAllMLRecommendations,
  updateUserInteraction,
  trainModel,
  getModelMetrics,
  isMLServiceAvailable
} = mlApiService;