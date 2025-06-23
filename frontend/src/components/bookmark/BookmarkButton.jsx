// components/bookmark/BookmarkButton.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBookmark } from '../../hooks/useBookmark';

const BookmarkButton = ({ 
  recipe, 
  variant = 'default', // 'default', 'small', 'large'
  className = '',
  showText = true,
  onBookmarkChange = null 
}) => {
  const { isAuthenticated } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmark();
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const recipeId = recipe?.item_id || recipe?.id;

  useEffect(() => {
    if (isAuthenticated && recipeId) {
      setBookmarked(isBookmarked(recipeId));
    }
  }, [isAuthenticated, recipeId, isBookmarked]);

  const handleToggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Silakan login untuk menggunakan fitur bookmark');
      return;
    }

    if (loading || !recipeId) return;

    try {
      setLoading(true);
      const newBookmarkStatus = await toggleBookmark(recipe);
      setBookmarked(newBookmarkStatus);
      
      if (onBookmarkChange) {
        onBookmarkChange(newBookmarkStatus);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Gagal mengubah bookmark: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = "inline-flex items-center justify-center rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border";
    
    switch (variant) {
      case 'small':
        return `${baseStyles} p-2`;
      case 'large':
        return `${baseStyles} p-4`;
      default:
        return `${baseStyles} p-3`;
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  const getTextSize = () => {
    switch (variant) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  if (!isAuthenticated) {
    return null; // Don't show bookmark button if not authenticated
  }

  return (
    <button
      onClick={handleToggleBookmark}
      disabled={loading}
      className={`group ${getVariantStyles()} ${
        bookmarked 
          ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' 
          : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={bookmarked ? 'Hapus dari bookmark' : 'Tambah ke bookmark'}
    >
      {loading ? (
        <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${getIconSize()}`}></div>
      ) : (
        <>
          <svg 
            className={`${getIconSize()} transform group-hover:scale-110 transition-transform duration-300 ${
              bookmarked ? 'animate-pulse' : ''
            } ${showText ? 'mr-2' : ''}`}
            fill={bookmarked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          {showText && (
            <span className={`font-medium ${getTextSize()}`}>
              {bookmarked ? 'Tersimpan' : 'Simpan'}
            </span>
          )}
        </>
      )}
    </button>
  );
};

export default BookmarkButton;