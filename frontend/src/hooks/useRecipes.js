// src/hooks/useRecipes.js
import { useState, useEffect } from 'react';
import { loadGuestRecipes } from '../utils/recipeService';
import { RecipeAPI } from '../utils/recipeApi';

export const useRecipes = (isLoggedIn) => {
  const [guestRecipes, setGuestRecipes] = useState({
    topMenuHemat: [],
    banyakDisukai: [],
    topAndalan: []
  });
  const [userRecipes, setUserRecipes] = useState({
    untukKamu: [],
    preferensiSama: [],
    topWerecooked: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      const guestRecipesResult = await loadGuestRecipes();
      
      if (guestRecipesResult) {
        setGuestRecipes({
          topMenuHemat: guestRecipesResult.topMenuHemat || [],
          banyakDisukai: guestRecipesResult.banyakDisukai || [],
          topAndalan: guestRecipesResult.topAndalan || []
        });
      }

      // Load user recipes if logged in
      if (isLoggedIn) {
        // Implement user recipes loading
      }

    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat resep');
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [isLoggedIn]);

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
    guestRecipes,
    userRecipes,
    loading,
    error,
    handleSearch,
    reloadRecipes: loadRecipes
  };
};