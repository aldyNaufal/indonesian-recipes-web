// src/services/apiService.js
import axios from 'axios';

const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000';
const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    // Auth API instance
    this.authApi = axios.create({
      baseURL: AUTH_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ML API instance
    this.mlApi = axios.create({
      baseURL: ML_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor untuk menambahkan token ke kedua API
    const addTokenInterceptor = (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };

    this.authApi.interceptors.request.use(addTokenInterceptor);
    this.mlApi.interceptors.request.use(addTokenInterceptor);

    // Response interceptor untuk handle errors
    const handleErrorInterceptor = (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    };

    this.authApi.interceptors.response.use(
      (response) => response,
      handleErrorInterceptor
    );

    this.mlApi.interceptors.response.use(
      (response) => response,
      handleErrorInterceptor
    );
  }

  // Auth methods (menggunakan auth backend)
  async login(email, password) {
    const response = await this.authApi.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async logout() {
    try {
      await this.authApi.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  async validateToken() {
    const response = await this.authApi.get('/api/auth/validate');
    return response.data;
  }

  async getUserProfile() {
    const response = await this.authApi.get('/api/user/profile');
    return response.data;
  }

  // ML Recommendation methods (menggunakan ML backend)
  async getRecommendationsForExistingUser(userId) {
    const response = await this.mlApi.get(`/api/recommendations/existing-user/${userId}`);
    return response.data;
  }

  async getRecommendationsForNewUser(preferences) {
    const response = await this.mlApi.post('/api/recommendations/new-user', preferences);
    return response.data;
  }

  async getContentBasedRecommendations(data) {
    const response = await this.mlApi.post('/api/recommendations/content-based', data);
    return response.data;
  }

  async getRecommendationOptions() {
    const response = await this.mlApi.get('/api/recommendations/options');
    return response.data;
  }

  // Health checks
  async checkAuthHealth() {
    const response = await this.authApi.get('/api/health');
    return response.data;
  }

  async checkMLHealth() {
    const response = await this.mlApi.get('/api/recommendations/health');
    return response.data;
  }
}

export default new ApiService();