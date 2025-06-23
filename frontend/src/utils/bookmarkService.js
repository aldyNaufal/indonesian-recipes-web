// utils/bookmarkService.js
import { apiGet, apiPost, apiDelete } from './httpClient.js';

// Mendapatkan semua bookmark user
export const getBookmarks = async (token) => {
  try {
    const response = await apiGet('api/bookmark', token);
    // Backend mengembalikan { error: false, data: [...] }
    if (response.error) {
      throw new Error(response.message || 'Gagal memuat bookmark');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    throw new Error('Gagal memuat bookmark');
  }
};

// Menambahkan bookmark baru
export const addBookmark = async (token, bookmarkData) => {
  try {
    const response = await apiPost('api/bookmark', bookmarkData, token);
    // Backend mengembalikan { error: false/true, message: "..." }
    if (response.error) {
      throw new Error(response.message || 'Gagal menambahkan bookmark');
    }
    return response;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    // Handle specific error cases
    if (error.message && error.message.includes('409')) {
      throw new Error('Resep sudah dibookmark');
    }
    throw new Error('Gagal menambahkan bookmark');
  }
};

// Menghapus bookmark
export const removeBookmark = async (token, bookmarkId) => {
  try {
    // Backend menggunakan parameter 'id', bukan 'bookmarkId'
    const response = await apiDelete(`api/bookmark/${bookmarkId}`, token);
    // Backend mengembalikan { error: false/true, message: "..." }
    if (response.error) {
      throw new Error(response.message || 'Gagal menghapus bookmark');
    }
    return response;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    // Handle specific error cases
    if (error.message && error.message.includes('404')) {
      throw new Error('Bookmark tidak ditemukan');
    }
    throw new Error('Gagal menghapus bookmark');
  }
};

// Mengecek apakah resep sudah di-bookmark
export const checkBookmarkStatus = async (token, recipeId) => {
  try {
    const bookmarks = await getBookmarks(token);
    return bookmarks.some(bookmark => bookmark.recipeId === recipeId);
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};