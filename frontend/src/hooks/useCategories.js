// src/hooks/useCategories.js
import { useState, useEffect } from 'react';
import { loadCategories } from '../utils/recipeService';
import { RecipeAPI } from '../utils/recipeApi'


export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategoriesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoriesResult = await loadCategories();
      setCategories(categoriesResult || []);
      
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriesData();
  }, []);

  const handleCategoryClick = async (categoryName) => {
    try {
      setLoading(true);
      const result = await RecipeAPI.getRecipesByCategory(categoryName, {
        page: 1,
        limit: 12
      });
      
      console.log('Category recipes:', result);
      return result;
    } catch (error) {
      console.error('Error fetching category recipes:', error);
      setError('Gagal memuat resep kategori');
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    handleCategoryClick,
    reloadCategories: loadCategoriesData
  };
};