// src/hooks/useCategories.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Tambahkan import ini
import { loadCategories } from '../utils/recipeService';
import { RecipeAPI } from '../utils/recipeApi';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Tambahkan hook ini

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
      
      // Fetch data terlebih dahulu
      const result = await RecipeAPI.getRecipesByCategory(categoryName, {
        page: 1,
        limit: 12
      });
      
      console.log('Category recipes:', result);
      
      // Setelah data berhasil di-fetch, baru navigate
      const categorySlug = categoryName.toLowerCase();
      navigate(`/category/${categorySlug}`, {
        state: { recipes: result } // Opsional: kirim data via state
      });
      
      return result;
    } catch (error) {
      console.error('Error fetching category recipes:', error);
      setError('Gagal memuat resep kategori');
      // Tidak navigate jika ada error
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