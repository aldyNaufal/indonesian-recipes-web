// services/recommendationService.js
import { flaskApiUrl } from '../config/config.js';

class RecommendationService {
  constructor() {
    this.baseUrl = flaskApiUrl;
  }

  // Helper method untuk HTTP requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error making request to ${endpoint}:`, error);
      throw error;
    }
  }

  // Get recommendations for existing user with interaction history
  async getExistingUserRecommendations(userId, token, topK = 10) {
    try {
      const endpoint = `/recommendation/existing-user/${userId}?top_k=${topK}`;
      
      return await this.makeRequest(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error getting existing user recommendations:', error);
      throw error;
    }
  }

  // Get recommendations for new user based on preferences
  async getNewUserRecommendations(preferences, token, topK = 10) {
    try {
      const endpoint = `/recommendation/new-user`;
      
      const payload = {
        preferences,
        top_k: topK
      };
      
      return await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error getting new user recommendations:', error);
      throw error;
    }
  }

  // Get recommendations based on similar users
  async getSimilarUserRecommendations(userId, preferences, token, topK = 10) {
    try {
      const endpoint = `/recommendation/existing-user`;
      
      const payload = {
        user_id: userId,
        preferences,
        top_k: topK
      };
      
      return await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error getting similar user recommendations:', error);
      throw error;
    }
  }

  // Health check for ML API
  async healthCheck() {
    try {
      return await this.makeRequest('/health');
    } catch (error) {
      console.error('ML API health check failed:', error);
      return { status: 'error', message: error.message };
    }
  }
}

export default new RecommendationService();