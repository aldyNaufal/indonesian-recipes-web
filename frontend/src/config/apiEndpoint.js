import { baseUrl, flaskApiUrl } from './config.js';

export const API_ENDPOINTS = {
  // Node.js endpoints (existing)
  NODE: {
    BASE: baseUrl ? `${baseUrl}/api` : '/api',
    RECIPES: {
      GUEST: '/recipes/guest',
      ALL: '/recipes',
      SEARCH: '/recipes/search'
    }
  },
  
  // Flask ML endpoints (new)
  FLASK: {
    BASE: `${flaskApiUrl}/api`,
    RECOMMENDATIONS: {
      EXISTING_USER: (userId) => `/recommendations/existing-user/${userId}`,
      NEW_USER: '/recommendations/new-user',
    }
  }
};