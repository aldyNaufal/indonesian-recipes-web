// components/bookmark/BookmarkCardWrapper.jsx
import React, { useState } from 'react';
import RecipeCard from '../recipe/RecipeCard';
import { useAuth } from '../../context/AuthContext';
import { removeBookmark } from '../../utils/bookmarkService';

const BookmarkCardWrapper = ({ bookmark, index, onRemove }) => {
  const { token } = useAuth();
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isRemoving) return;
    
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus bookmark ini?');
    if (!confirmed) return;

    try {
      setIsRemoving(true);
      await removeBookmark(token, bookmark.bookmarkId);
      onRemove(bookmark.bookmarkId);
    } catch (err) {
      console.error('Error removing bookmark:', err);
      alert('Gagal menghapus bookmark: ' + err.message);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="relative group">
      <RecipeCard 
        recipe={bookmark} 
        index={index}
        cardType="auto"
        isGridLayout={true}
      />
      
      {/* Remove Bookmark Button - positioned absolutely */}
      <button
        onClick={handleRemoveBookmark}
        disabled={isRemoving}
        className={`absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-200 z-10 ${
          isRemoving ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'
        }`}
        title="Hapus dari bookmark"
      >
        {isRemoving ? (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* Optional: Bookmark indicator badge */}
      <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg z-10">
        <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        Saved
      </div>
    </div>
  );
};

export default BookmarkCardWrapper;