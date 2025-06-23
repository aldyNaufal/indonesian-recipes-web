// BookmarkPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBookmarks } from '../../utils/bookmarkService';
import BookmarkCardWrapper from '../../components/bookmark/BookmarkCard';

const BookmarkPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const itemsPerPage = 12; // Jumlah item per halaman

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBookmarks();
  }, [isAuthenticated, navigate]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const bookmarksData = await getBookmarks(token);

      // Transform data agar sesuai dengan format RecipeCard
      const transformedBookmarks = bookmarksData.map(bookmark => ({
        item_id: bookmark.recipeId,
        'Title Cleaned': bookmark.title,
        'Image URL': bookmark.image,
        Category: 'Bookmark',
        total_rating: 4.5, // Default rating karena tidak tersimpan di bookmark
        Complexity: 'Medium', // Default complexity
        createdAt: bookmark.createdAt,
        bookmarkId: bookmark._id || bookmark.id
      }));

      setBookmarks(transformedBookmarks);
    } catch (err) {
      setError(err.message || 'Gagal memuat bookmark');
      console.error('Error loading bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = (bookmarkId) => {
    // Update state dengan menghapus bookmark yang dihapus
    setBookmarks(prevBookmarks => 
      prevBookmarks.filter(bookmark => bookmark.bookmarkId !== bookmarkId)
    );
  };;

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pagination logic
  const totalItems = bookmarks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookmarks = bookmarks.slice(startIndex, endIndex);

  const pagination = {
    page: currentPage,
    limit: itemsPerPage,
    total: totalItems,
    totalPages: totalPages
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Diperlukan</h2>
          <p className="text-gray-600 mb-4">Silakan login untuk melihat bookmark Anda</p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Memuat bookmark Anda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchBookmarks}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">🔖</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Bookmark Saya
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {totalItems} resep tersimpan
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <a href="/" className="hover:text-red-600 transition-colors">Beranda</a>
            <span className="mx-2">›</span>
            <span className="text-gray-800">Bookmark</span>
          </div>
        </div>
      </div>

      {/* Bookmarks Content */}
      <div className="container mx-auto px-6 py-8">
        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📖</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Belum Ada Bookmark
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              Anda belum memiliki resep yang di-bookmark. Mulai jelajahi resep dan simpan yang Anda sukai!
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Jelajahi Resep
            </button>
          </div>
        ) : (
          <>
            {/* Bookmark Stats */}
            <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold">{startIndex + 1}</span> - 
                  <span className="font-semibold">{Math.min(endIndex, totalItems)}</span> dari 
                  <span className="font-semibold"> {totalItems}</span> bookmark
                </div>
                <div className="text-sm text-gray-600">
                  Halaman <span className="font-semibold">{currentPage}</span> dari 
                  <span className="font-semibold"> {totalPages}</span>
                </div>
              </div>
            </div>

            {/* Bookmarks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentBookmarks.map((bookmark, index) => (
                <BookmarkCardWrapper
                  key={bookmark.item_id || index}
                  bookmark={bookmark}
                  index={index}
                  onRemove={handleRemoveBookmark}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Komponen Pagination yang sama seperti di CategoryPage
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-center items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        
        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
              page === currentPage
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                : page === '...'
                ? 'border-gray-300 cursor-default text-gray-400'
                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Page Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Halaman {currentPage} dari {totalPages}
      </div>
    </div>
  );
};

export default BookmarkPage;