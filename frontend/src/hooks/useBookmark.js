// hooks/useBookmark.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookmarks, addBookmark, removeBookmark } from '../utils/bookmarkService';

export const useBookmark = () => {
  const { token, isAuthenticated } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all bookmarks
  const fetchBookmarks = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setBookmarks([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await getBookmarks(token);
      setBookmarks(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching bookmarks:', err);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  // Add bookmark
  const addToBookmarks = async (recipeData) => {
    if (!token || !isAuthenticated) {
      throw new Error('Silakan login terlebih dahulu');
    }
    
    try {
      const bookmarkData = {
        recipeId: recipeData.item_id || recipeData.id,
        title: recipeData['Title Cleaned'] || recipeData.title || recipeData.name,
        image: recipeData['Image URL'] || recipeData.image || recipeData.imageUrl
      };

      await addBookmark(token, bookmarkData);
      await fetchBookmarks(); // Refresh bookmarks
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  };

  // Remove bookmark by recipe ID
  const removeFromBookmarks = async (recipeId) => {
    if (!token || !isAuthenticated) {
      throw new Error('Silakan login terlebih dahulu');
    }
    
    try {
      // Find bookmark by recipe ID
      const bookmark = bookmarks.find(b => b.recipeId === recipeId);
      if (!bookmark) {
        throw new Error('Bookmark tidak ditemukan');
      }

      await removeBookmark(token, bookmark._id || bookmark.id);
      
      // Update local state
      setBookmarks(prev => prev.filter(b => b.recipeId !== recipeId));
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  };

  // Remove bookmark by bookmark ID
  const removeBookmarkById = async (bookmarkId) => {
    if (!token || !isAuthenticated) {
      throw new Error('Silakan login terlebih dahulu');
    }
    
    try {
      await removeBookmark(token, bookmarkId);
      
      // Update local state
      setBookmarks(prev => prev.filter(b => (b._id || b.id) !== bookmarkId));
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  };

  // Check if recipe is bookmarked
  const isBookmarked = useCallback((recipeId) => {
    return bookmarks.some(bookmark => bookmark.recipeId === recipeId);
  }, [bookmarks]);

  // Get bookmark by recipe ID
  const getBookmarkByRecipeId = useCallback((recipeId) => {
    return bookmarks.find(bookmark => bookmark.recipeId === recipeId);
  }, [bookmarks]);

  // Toggle bookmark status
  const toggleBookmark = async (recipeData) => {
    const recipeId = recipeData.item_id || recipeData.id;
    
    if (isBookmarked(recipeId)) {
      await removeFromBookmarks(recipeId);
      return false; // Removed
    } else {
      await addToBookmarks(recipeData);
      return true; // Added
    }
  };

  // Initialize bookmarks when component mounts or auth state changes
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarks,
    loading,
    error,
    fetchBookmarks,
    addToBookmarks,
    removeFromBookmarks,
    removeBookmarkById,
    toggleBookmark,
    isBookmarked,
    getBookmarkByRecipeId,
    bookmarkCount: bookmarks.length
  };
};