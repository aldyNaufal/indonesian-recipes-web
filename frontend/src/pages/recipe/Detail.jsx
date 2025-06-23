// src/components/Detail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadRecipeDetail } from '../../utils/recipeService';
import RecipeImage from '../../components/recipe/RecipeImage';
import { useAuth } from '../../context/AuthContext';
import { checkBookmarkStatus, addBookmark, removeBookmark } from '../../utils/bookmarkService';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  
  // State untuk bookmark
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Fungsi untuk mengecek status bookmark
  const checkBookmarkStatusForRecipe = async (recipeId) => {
    try {
      if (!token) return;
      const bookmarkStatus = await checkBookmarkStatus(token, recipeId);
      setIsBookmarked(bookmarkStatus);
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  // Fungsi untuk memuat detail resep
  const fetchRecipe = async (recipeId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching recipe with ID:', recipeId);
      
      const recipeData = await loadRecipeDetail(recipeId);
      console.log('Recipe loaded:', recipeData);
      
      setRecipe(recipeData);
    } catch (err) {
      console.error('Error loading recipe:', err);
      setError(err.message || 'Gagal memuat detail resep');
    } finally {
      setLoading(false);
    }
  };

  // useEffect untuk memuat resep dan cek bookmark
  useEffect(() => {
    if (id) {
      fetchRecipe(id);
      if (isAuthenticated && token) {
        checkBookmarkStatusForRecipe(id);
      }
    } else {
      setError('Recipe ID not provided');
      setLoading(false);
    }
  }, [id, isAuthenticated, token]);

  // Fungsi untuk toggle bookmark
  const toggleBookmark = async () => {
    if (!isAuthenticated || !token) {
      navigate('/login', { 
        state: { from: `/recipe/${id}`, message: 'Silakan login untuk menambah bookmark' }
      });
      return;
    }
    
    if (!recipe) return;
    setBookmarkLoading(true);
    
    try {
      if (isBookmarked) {
        // Hapus bookmark
        await removeBookmark(token, id);
        setIsBookmarked(false);
        showNotification('Bookmark dihapus', 'success');
      } else {
        // Tambah bookmark
        const bookmarkData = {
          recipeId: id,
          title: recipe['Title Cleaned'],
          image: recipe['Image URL']
        };
        
        await addBookmark(token, bookmarkData);
        setIsBookmarked(true);
        showNotification('Bookmark berhasil ditambahkan', 'success');
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      showNotification(error.message || 'Terjadi kesalahan', 'error');
    } finally {
      setBookmarkLoading(false);
    }
  };
  
  // Fungsi untuk menampilkan notifikasi
  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const getRating = (recipe) => {
    const rating = recipe?.total_rating || recipe?.rating || recipe?.Rating;
    if (!rating) return 'N/A';
    return typeof rating === 'number' ? rating.toFixed(1) : rating;
  };

  const getOptimizedImageUrl = (originalUrl) => {
    if (!originalUrl) return null;
    
    try {
      new URL(originalUrl);
      if (originalUrl.includes('wsrv.nl')) {
        return originalUrl;
      }
      return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=400&h=300&fit=cover&output=webp`;
    } catch (error) {
      console.error('Invalid image URL:', originalUrl, error);
      return originalUrl;
    }
  };

  const parseAndCleanSteps = (stepsData) => {
    let steps = [];
    if (typeof stepsData === 'string') {
      try {
        const jsonString = stepsData.replace(/'/g, '"');
        steps = JSON.parse(jsonString);
      } catch (error) {
        return [];
      }
    } else if (Array.isArray(stepsData)) {
      steps = stepsData;
    }
    
    return steps.map(step => step.replace(/^step\s+\d+\s*/i, ''));
  };

  const parseIngredients = (ingredientsString) => {
    if (!ingredientsString) return [];
    
    return ingredientsString
      .split(',')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);
  };

  function toTitleCase(str) {
    if (!str) return 'Judul tidak tersedia';
    
    const smallWords = ['dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'dalam', 'yang', 'adalah', 'akan', 'telah', 'sudah', 'masih', 'juga', 'hanya', 'tidak', 'bukan', 'agar', 'supaya', 'bila', 'jika', 'kalau', 'karena', 'sebab', 'oleh', 'tentang', 'antara', 'hingga', 'sampai', 'serta', 'bahwa', 'seperti', 'bagaikan', 'ibarat'];
    
    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !smallWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail resep...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Resep Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Resep yang Anda cari tidak tersedia</p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const optimizedImageUrl = getOptimizedImageUrl(recipe['Image URL']);
  const steps = parseAndCleanSteps(recipe['Steps Cleaned']);
  const ingredients = recipe['Ingredients Cleaned'] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section with Back Button */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              {/* Back Button */}
              <button
                onClick={() => window.history.back()}
                className="group flex items-center bg-white hover:bg-gray-50 text-gray-700 hover:text-red-600 px-4 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
              >
                <svg 
                  className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Kembali</span>
              </button>

              {/* Page Actions */}
              <div className="flex items-center space-x-3">

                {/* Bookmark Button */}
                <button
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                  className={`group p-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border ${
                    isBookmarked 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' 
                      : 'bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-200'
                  } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isBookmarked ? 'Hapus dari bookmark' : 'Tambah ke bookmark'}
                >
                  {bookmarkLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                  ) : (
                    <svg 
                      className={`w-5 h-5 transform group-hover:scale-110 transition-transform duration-300 ${
                        isBookmarked ? 'animate-pulse' : ''
                      }`} 
                      fill={isBookmarked ? 'currentColor' : 'none'} 
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
                  )}
                </button>
              </div>
            </div>

            {/* Title Section */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                {toTitleCase(recipe['Title Cleaned']) || 'Judul tidak tersedia'}
              </h1>
              {/* Rating Section - Moved to Header */}
              <div className="flex items-center justify-center mb-2">
                <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 rounded-full shadow-lg">
                  <span className="text-2xl mr-2">⭐</span>
                  <span className="text-xl font-bold">
                    {getRating(recipe)}
                  </span>
                  <span className="ml-1 opacity-90">/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Image */}
            <div className="space-y-6">
              {/* Image Section */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                {optimizedImageUrl && !imageError ? (
                  <div className="aspect-[4/3] bg-gray-200 overflow-hidden">
                    <RecipeImage
                      src={optimizedImageUrl}
                      alt={recipe['Title Cleaned']}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                      onError={() => setImageError(true)}
                      fallbackSrc={recipe['Image URL']}
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2 animate-bounce">🍽️</div>
                      <div className="text-gray-600 font-medium">No Image Available</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-3xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">🚀</span>
                  Aksi Cepat
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {/* Recipe Link Button */}
                  {recipe.URL && (
                    <a 
                      href={recipe.URL} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-between shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-xl">🔗</span>
                        <div>
                          <div className="font-semibold">Resep Lengkap</div>
                          <div className="text-sm opacity-90">Lihat detail di sumber</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                  
                  {/* YouTube Video Button */}
                  {recipe?.['Title Cleaned'] && (
                    <a 
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`cara membuat ${recipe['Title Cleaned']}`)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-between shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="flex items-center">
                        <span className="mr-3 text-xl">📺</span>
                        <div>
                          <div className="font-semibold">Video Tutorial</div>
                          <div className="text-sm opacity-90">Cari di YouTube</div>
                        </div>
                      </div>
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Recipe Details */}
            <div className="space-y-6">
              {/* Steps Section */}
              {steps.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                    <span className="mr-3 text-2xl">📝</span>
                    Langkah-langkah Pembuatan
                  </h2>
                  <div className="space-y-5">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-start group hover:bg-gray-50 p-3 rounded-xl transition-colors duration-200">
                        <span className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold mr-4 mt-0.5 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-200">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed flex-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bahan-bahan Section */}
              {ingredients.length > 0 && (
                <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                    <span className="mr-3 text-2xl">🥘</span>
                    Bahan-bahan
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {parseIngredients(ingredients).map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-300 transition-all duration-200 hover:scale-105 cursor-default shadow-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                  <span className="mr-3 text-2xl">ℹ️</span>
                  Informasi Tambahan
                </h2>
                <div className="space-y-4">
                  {/* Category */}
                  {recipe.Category && (
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <span className="text-gray-700 font-semibold flex items-center">
                        <span className="mr-2">🏷️</span>
                        Kategori:
                      </span>
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                        {recipe.Category}
                      </span>
                    </div>
                  )}
                  
                  {/* Total Steps */}
                  {recipe['Total Steps'] && (
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <span className="text-gray-700 font-semibold flex items-center">
                        <span className="mr-2">📊</span>
                        Total Langkah:
                      </span>
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                        {recipe['Total Steps']} langkah
                      </span>
                    </div>
                  )}
                  
                  {/* Total Ingredients */}
                  {recipe['Total Ingredients'] && (
                    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                      <span className="text-gray-700 font-semibold flex items-center">
                        <span className="mr-2">🛒</span>
                        Total Bahan:
                      </span>
                      <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                        {recipe['Total Ingredients']} bahan
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;