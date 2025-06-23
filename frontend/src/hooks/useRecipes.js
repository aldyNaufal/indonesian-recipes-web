// src/hooks/useRecipes.js
import { useState, useEffect } from 'react';
import { loadGuestRecipes, loadMLRecommendations } from '../utils/recipeService';
import { RecipeAPI } from '../utils/recipeApi';
import { flaskApiGet, flaskApiPost, apiGet, mlApi } from '../utils/httpClient.js';

export const useRecipes = (isLoggedIn, user = null, userPreferences = null) => {
  // State yang sudah ada
  const [guestRecipes, setGuestRecipes] = useState({
    topMenuHemat: [],
    banyakDisukai: [],
    topAndalan: []
  });
  
  // State untuk ML recommendations
  const [userRecipes, setUserRecipes] = useState({
    untukKamu: [],
    preferensiSama: [],
    topWerecooked: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState(null);

  // Static fallback data untuk ML recommendations
  const getStaticMLFallback = () => {
    return {
      existingUserFallback: {
        user_id: 1,
        preferred_difficulty: "Butuh Usaha",
        top_k: 15
      },
      newUserFallback: {
        preferred_categories: ["Ayam", "Sapi", "Ikan", "Sayuran", "Seafood"],
        preferred_difficulty: "Butuh Usaha",
        top_k: 15
      }
    };
  };

  // Helper function untuk memastikan response adalah array
  const ensureArray = (data, fallback = []) => {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object') {
      // Jika data adalah object, coba ambil property yang kemungkinan berisi array
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.recipes)) return data.recipes;
      if (Array.isArray(data.recommendations)) return data.recommendations;
      if (Array.isArray(data.results)) return data.results;
    }
    console.warn('Expected array but got:', typeof data, data);
    return fallback;
  };

  // Function yang sudah ada - tetap sama
  const loadGuestRecipesData = async () => {
    try {
      const guestRecipesResult = await loadGuestRecipes();
      if (guestRecipesResult) {
        setGuestRecipes({
          topMenuHemat: ensureArray(guestRecipesResult.topMenuHemat),
          banyakDisukai: ensureArray(guestRecipesResult.banyakDisukai),
          topAndalan: ensureArray(guestRecipesResult.topAndalan)
        });
      }
    } catch (error) {
      console.error('Error loading guest recipes:', error);
    }
  };

  // Enhanced Function dengan better error handling
  const loadUserRecipesData = async () => {
    if (!isLoggedIn || !user?.id) {
      console.log('User not logged in or no user ID, skipping ML recommendations');
      return;
    }

    try {
      setMlLoading(true);
      setMlError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const userId = user.id;
      console.log('Loading ML recommendations for user:', userId);

      // 1. Fetch User Preferences dengan error handling yang lebih baik
      let preferences = {
        preferred_categories: [],
        preferred_difficulty: "Butuh Usaha",
        top_k: 15,
      };

      try {
        const prefsData = await apiGet('/api/preferences', token);
        console.log('User preferences fetched:', prefsData);
        
        if (prefsData && prefsData.data) {
          preferences = {
            preferred_categories: ensureArray(prefsData.data.preferred_categories),
            preferred_difficulty: prefsData.data.skill_level || "Butuh Usaha",
            top_k: 15,
          };
        }
      } catch (prefsError) {
        console.warn('Failed to fetch preferences, using defaults:', prefsError);
      }

      // Get static fallback data
      const staticFallback = getStaticMLFallback();

      // 2. Check ML service health first
      const isMLHealthy = await checkMLHealth();
      console.log('ML service healthy:', isMLHealthy);

      let existingRecipes = [];
      let newUserRecipes = [];
      let topAndalanRecipes = [];

      // 3. Fetch recommendations with better error handling
      if (isMLHealthy) {
        try {
          // Parallel fetch dengan individual error handling
          const results = await Promise.allSettled([
            fetchExistingUserRecommendationsWithFallback(userId, token, staticFallback.existingUserFallback),
            fetchNewUserRecommendationsWithFallback(token, preferences, staticFallback.newUserFallback),
            fetchTopAndalanWithFallback()
          ]);

          // Process each result individually
          if (results[0].status === 'fulfilled') {
            existingRecipes = ensureArray(results[0].value);
            console.log('Existing user recommendations loaded:', existingRecipes.length);
          } else {
            console.warn('Existing user recommendations failed:', results[0].reason);
          }

          if (results[1].status === 'fulfilled') {
            newUserRecipes = ensureArray(results[1].value);
            console.log('New user recommendations loaded:', newUserRecipes.length);
          } else {
            console.warn('New user recommendations failed:', results[1].reason);
          }

          if (results[2].status === 'fulfilled') {
            topAndalanRecipes = ensureArray(results[2].value);
            console.log('Top andalan recipes loaded:', topAndalanRecipes.length);
          } else {
            console.warn('Top andalan failed:', results[2].reason);
          }

        } catch (mlError) {
          console.error('ML recommendations failed:', mlError);
          // Fall through to use guest recipe fallbacks
        }
      } else {
        console.log('ML service unhealthy, using fallback recipes');
      }

      // 4. If ML failed or returned empty, use guest recipes as fallback
      if (existingRecipes.length === 0 && newUserRecipes.length === 0 && topAndalanRecipes.length === 0) {
        console.log('No ML recommendations available, using guest recipe fallbacks');
        const fallbackRecipes = await loadGuestRecipes();
        
        if (fallbackRecipes) {
          existingRecipes = ensureArray(fallbackRecipes.topAndalan).slice(0, 5);
          newUserRecipes = ensureArray(fallbackRecipes.banyakDisukai).slice(0, 5);
          topAndalanRecipes = ensureArray(fallbackRecipes.topMenuHemat).slice(0, 5);
        }
      }

      // 5. Set hasil ke state dengan safety checks
      setUserRecipes({
        untukKamu: ensureArray(existingRecipes).slice(0, 5),
        preferensiSama: ensureArray(newUserRecipes).slice(0, 5),
        topWerecooked: ensureArray(topAndalanRecipes).slice(0, 5),
      });

      console.log('ML recommendations loaded successfully');

    } catch (error) {
      console.error("ML recommendations failed:", error);
      setMlError(error.message);
      
      // Final fallback ke guest recipes
      try {
        console.log('Loading final fallback recipes...');
        const fallbackRecipes = await loadGuestRecipes();
        if (fallbackRecipes) {
          setUserRecipes({
            untukKamu: ensureArray(fallbackRecipes.topAndalan).slice(0, 5),
            preferensiSama: ensureArray(fallbackRecipes.banyakDisukai).slice(0, 5),
            topWerecooked: ensureArray(fallbackRecipes.topMenuHemat).slice(0, 5),
          });
        }
      } catch (fallbackError) {
        console.error('Final fallback recipes also failed:', fallbackError);
        // Set empty arrays as last resort
        setUserRecipes({
          untukKamu: [],
          preferensiSama: [],
          topWerecooked: [],
        });
      }
    } finally {
      setMlLoading(false);
    }
  };

  // Enhanced helper functions with better error handling
  const fetchExistingUserRecommendationsWithFallback = async (userId, token, staticFallback) => {
    try {
      console.log(`Fetching recommendations for user ${userId}`);
      const data = await flaskApiGet(`/api/recommendations/existing-user/${userId}`, token);
      return ensureArray(data?.recommendations);
      
    } catch (error) {
      console.log('User recommendations failed, trying static user ID 1:', error.message);
      
      try {
        const fallbackData = await flaskApiGet('/api/recommendations/existing-user/1', token);
        return ensureArray(fallbackData?.recommendations);
      } catch (fallbackError) {
        console.error('Static user recommendations also failed:', fallbackError.message);
        return [];
      }
    }
  };

  const fetchNewUserRecommendationsWithFallback = async (token, userPreferences, staticFallback) => {
    try {
      const preferencesToUse = userPreferences.preferred_categories.length > 0 
        ? userPreferences 
        : staticFallback;
        
      console.log('Using preferences for new user recommendations:', preferencesToUse);
      
      const data = await flaskApiPost('/api/recommendations/new-user', preferencesToUse, token);
      return ensureArray(data?.recommendations);
      
    } catch (error) {
      console.error('New user recommendations failed:', error.message);
      return [];
    }
  };

  const fetchTopAndalanWithFallback = async () => {
    try {
      const data = await RecipeAPI.getTopAndalan();
      return ensureArray(data);
    } catch (error) {
      console.error('Top andalan failed:', error.message);
      return [];
    }
  };

  // Helper function untuk check ML availability dengan timeout
  const checkMLHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('http://127.0.0.1:5000/api/recommendations/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('ML service health check timed out');
      } else {
        console.error('ML service health check failed:', error.message);
      }
      return false;
    }
  };

  // Alternative menggunakan mlApi dengan better error handling
  const loadUserRecipesDataWithMLApi = async () => {
    if (!isLoggedIn || !user?.id) {
      console.log('User not logged in or no user ID, skipping ML recommendations');
      return;
    }

    try {
      setMlLoading(true);
      setMlError(null);
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const userId = user.id;
      console.log('Loading ML recommendations for user:', userId);

      // 1. Fetch User Preferences
      let preferences = {
        preferred_categories: [],
        preferred_difficulty: "Butuh Usaha",
        top_k: 15,
      };

      try {
        const prefsData = await apiGet('/api/preferences', token);
        if (prefsData?.data) {
          preferences = {
            preferred_categories: ensureArray(prefsData.data.preferred_categories),
            preferred_difficulty: prefsData.data.skill_level || "Butuh Usaha",
            top_k: 15,
          };
        }
      } catch (prefsError) {
        console.warn('Failed to fetch preferences, using defaults');
      }

      // 2. Check ML health
      const isMLHealthy = await checkMLHealth();
      if (!isMLHealthy) {
        throw new Error('ML service is not available');
      }

      // 3. Menggunakan mlApi convenience methods dengan fallback
      const results = await Promise.allSettled([
        mlApi.getExistingUserRecommendations(userId, 15).catch(async () => {
          console.log('Falling back to user ID 1');
          return mlApi.getExistingUserRecommendations(1, 15);
        }),
        
        mlApi.getNewUserRecommendations(
          preferences.preferred_categories.length > 0 ? preferences : getStaticMLFallback().newUserFallback,
          15
        ),
        
        RecipeAPI.getTopAndalan()
      ]);

      // Process results dengan safety checks
      let existingRecipes = [];
      let newUserRecipes = [];
      let topAndalanRecipes = [];

      if (results[0].status === 'fulfilled') {
        existingRecipes = ensureArray(results[0].value);
      }

      if (results[1].status === 'fulfilled') {
        newUserRecipes = ensureArray(results[1].value);
      }

      if (results[2].status === 'fulfilled') {
        topAndalanRecipes = ensureArray(results[2].value);
      }

      // Set hasil ke state
      setUserRecipes({
        untukKamu: existingRecipes.slice(0, 5),
        preferensiSama: newUserRecipes.slice(0, 5),
        topWerecooked: topAndalanRecipes.slice(0, 5),
      });

      console.log('ML recommendations loaded successfully');

    } catch (error) {
      console.error("ML recommendations failed:", error);
      setMlError(error.message);
      
      // Fallback logic
      try {
        const fallbackRecipes = await loadGuestRecipes();
        if (fallbackRecipes) {
          setUserRecipes({
            untukKamu: ensureArray(fallbackRecipes.topAndalan).slice(0, 5),
            preferensiSama: ensureArray(fallbackRecipes.banyakDisukai).slice(0, 5),
            topWerecooked: ensureArray(fallbackRecipes.topMenuHemat).slice(0, 5),
          });
        }
      } catch (fallbackError) {
        console.error('Fallback recipes also failed:', fallbackError);
        setUserRecipes({
          untukKamu: [],
          preferensiSama: [],
          topWerecooked: [],
        });
      }
    } finally {
      setMlLoading(false);
    }
  };

  // Main load function dengan better error recovery
  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading recipes:', { isLoggedIn, userId: user?.id });
      
      if (isLoggedIn && user?.id) {
        console.log('Loading recipes for logged-in user:', user);
        
        // Load guest recipes first (as fallback), then ML recommendations
        await loadGuestRecipesData();
        await loadUserRecipesData(); // Using the enhanced version
      } else {
        console.log('Loading guest recipes only');
        await loadGuestRecipesData();
      }
    } catch (err) {
      console.error('Error in loadRecipes:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat resep');
    } finally {
      setLoading(false);
    }
  };

  // Effect untuk auto-load saat dependencies berubah
  useEffect(() => {
    console.log('useRecipes effect triggered:', { 
      isLoggedIn, 
      userId: user?.id, 
      isNew: user?.isNew 
    });
    
    // Delay sedikit untuk memastikan token sudah tersimpan
    const timeoutId = setTimeout(() => {
      loadRecipes();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isLoggedIn, user?.id]);

  // Function untuk retry ML recommendations
  const retryMLRecommendations = async () => {
    if (isLoggedIn && user?.id) {
      console.log('Retrying ML recommendations...');
      await loadUserRecipesData();
    }
  };

  // Search function (existing)
  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const result = await RecipeAPI.getAllRecipes({
        search: searchQuery,
        page: 1,
        limit: 20
      });
      
      console.log('Search results:', result);
      return result;
    } catch (error) {
      console.error('Error searching recipes:', error);
      setError('Gagal mencari resep');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Function untuk manual test static endpoints
  const testStaticEndpoints = async () => {
    console.log('Testing static ML endpoints...');
    
    try {
      const token = localStorage.getItem("token");
      const staticFallback = getStaticMLFallback();
      
      const isHealthy = await checkMLHealth();
      console.log('ML service health:', isHealthy);
      
      if (!isHealthy) {
        throw new Error('ML service is not available');
      }
      
      // Test existing user dengan user ID 1
      const existingTest = await fetchExistingUserRecommendationsWithFallback(1, token, staticFallback.existingUserFallback);
      console.log('Static existing user test result:', existingTest);
      
      // Test new user dengan static preferences
      const newUserTest = await fetchNewUserRecommendationsWithFallback(token, {preferred_categories: []}, staticFallback.newUserFallback);
      console.log('Static new user test result:', newUserTest);
      
      return {
        mlHealthy: isHealthy,
        existingUser: existingTest,
        newUser: newUserTest
      };
    } catch (error) {
      console.error('Static endpoints test failed:', error);
      throw error;
    }
  };

  return {
    // Data
    guestRecipes,
    userRecipes,
    
    // Loading states
    loading,
    mlLoading,
    
    // Error states
    error,
    mlError,
    
    // Functions
    handleSearch,
    reloadRecipes: loadRecipes,
    retryMLRecommendations,
    checkMLHealth,
    testStaticEndpoints,
    
    // Helper states
    hasMLRecommendations: userRecipes.untukKamu.length > 0 || 
                         userRecipes.preferensiSama.length > 0 || 
                         userRecipes.topWerecooked.length > 0,
    
    // Debug info
    debugInfo: {
      isLoggedIn,
      userId: user?.id,
      hasToken: !!localStorage.getItem("token"),
      mlRecipesCount: {
        untukKamu: userRecipes.untukKamu.length,
        preferensiSama: userRecipes.preferensiSama.length,
        topWerecooked: userRecipes.topWerecooked.length
      },
      staticFallback: getStaticMLFallback()
    }
  };
};