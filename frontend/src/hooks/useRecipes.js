// src/hooks/useRecipes.js
import { useState, useEffect } from 'react';
import { loadGuestRecipes, loadMLRecommendations } from '../utils/recipeService';
import { RecipeAPI } from '../utils/recipeApi';

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

   // Function yang sudah ada - tetap sama
  const loadGuestRecipesData = async () => {
    const guestRecipesResult = await loadGuestRecipes();
    if (guestRecipesResult) {
      setGuestRecipes({
        topMenuHemat: guestRecipesResult.topMenuHemat || [],
        banyakDisukai: guestRecipesResult.banyakDisukai || [],
        topAndalan: guestRecipesResult.topAndalan || []
      });
    }
  };

  // Function untuk load ML recommendations
  const loadUserRecipesData = async () => {
    if (!isLoggedIn || !user?.id) return;
    
    try {
      setMlLoading(true);
      setMlError(null);
      
      console.log('Loading ML recommendations for user:', user.id);
      
      // Determine if user is new or existing
      const userId = user.isNew ? 'new' : user.id;
      
      // Get user preferences (could come from user profile, onboarding, etc.)
      const preferences = userPreferences || user.preferences || {
        dietary_restrictions: user.dietary_restrictions || [],
        preferred_cuisines: user.preferred_cuisines || ['Indonesian'],
        cooking_time_preference: user.cooking_time_preference || 'medium',
        difficulty_level: user.difficulty_level || 'beginner'
      };
      
      const mlRecipes = await loadMLRecommendations(userId, preferences);
      
      console.log('ML Recommendations loaded:', mlRecipes);
      
      setUserRecipes({
        untukKamu: mlRecipes.untukKamu || [],
        preferensiSama: mlRecipes.preferensiSama || [],
        topWerecooked: mlRecipes.topWerecooked || []
      });
      
    } catch (error) {
      console.error('ML recommendations failed:', error);
      setMlError(error.message);
      
      // Fallback: use guest recipes structure for logged-in users
      const fallbackRecipes = await loadGuestRecipes();
      setUserRecipes({
        untukKamu: fallbackRecipes.topAndalan || [],
        preferensiSama: fallbackRecipes.banyakDisukai || [],
        topWerecooked: fallbackRecipes.topMenuHemat || []
      });
    } finally {
      setMlLoading(false);
    }
  };

  // Main load function
  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isLoggedIn && user?.id) {
        console.log('Loading recipes for logged-in user:', user);
        
        // Load both guest recipes (as fallback) and ML recommendations
        await Promise.all([
          loadGuestRecipesData(),
          loadUserRecipesData()
        ]);
      } else {
        console.log('Loading guest recipes');
        
        // Load guest recipes for non-logged-in users
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
    console.log('useRecipes effect triggered:', { isLoggedIn, userId: user?.id });
    loadRecipes();
  }, [isLoggedIn, user?.id, user?.isNew]);

  // Function untuk retry ML recommendations
  const retryMLRecommendations = async () => {
    if (isLoggedIn && user?.id) {
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
    } finally {
      setLoading(false);
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
    
    // Helper states
    hasMLRecommendations: userRecipes.untukKamu.length > 0 || 
                         userRecipes.preferensiSama.length > 0 || 
                         userRecipes.topWerecooked.length > 0
  };
};