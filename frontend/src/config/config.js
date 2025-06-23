// config.js - Configuration utilities
export const getBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return '';
};

export const getFlaskApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  return ''; // Ganti dengan domain production Flask API Anda
};

export const baseUrl = getBaseUrl();
export const flaskApiUrl = getFlaskApiUrl();

// ML API Configuration
export const mlApiConfig = {
  baseUrl: getFlaskApiUrl(),
  endpoints: {
    existingUser: 'api/recommendations/existing-user',
    newUser: 'api/recommendations/new-user',
    healthCheck: '/health',
  },
  defaultParams: {
    topK: 10
  }
};

// Complete configuration object
export const config = {
  api: {
    baseUrl: baseUrl,
    timeout: 10000
  },
  mlApi: mlApiConfig,
  features: {
    recommendations: true,
    preferences: true
  }
};

export default config;