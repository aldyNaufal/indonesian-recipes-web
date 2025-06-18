import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RecipeAPI, loadCategories, loadGuestRecipes } from '../utils/api';
import food from '../assets/cook.png'; // Pastikan path ini benar

const HomeView = () => {
  // States
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userName, setUserName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
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
  
  // Refs
  const categoryScrollRef = useRef(null);
  
  // Get auth token from localStorage or state management
  const getAuthToken = () => {
    // Sesuaikan dengan cara Anda menyimpan token
    // return localStorage.getItem('authToken'); // Jika menggunakan localStorage
    return null; // Untuk saat ini return null
  };
  
  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Menggunakan function yang sudah dibuat di API service
        const [categoriesResult, guestRecipesResult] = await Promise.allSettled([
          loadCategories(),
          loadGuestRecipes()
        ]);
        
        // Handle categories
        if (categoriesResult.status === 'fulfilled') {
          setCategories(categoriesResult.value || []);
        } else {
          console.error('Error loading categories:', categoriesResult.reason);
        }
        
        // Handle guest recipes
        if (guestRecipesResult.status === 'fulfilled') {
          const recipes = guestRecipesResult.value;
          setGuestRecipes({
            topMenuHemat: recipes.topMenuHemat || [],
            banyakDisukai: recipes.banyakDisukai || [],
            topAndalan: recipes.topAndalan || []
          });
        } else {
          console.error('Error loading guest recipes:', guestRecipesResult.reason);
        }
        
        // Jika user login, fetch personalized recipes
        if (isLoggedIn) {
          const token = getAuthToken();
          // Contoh untuk authenticated requests
          // const userRecipesData = await apiGet('/user/recommendations', token);
          // setUserRecipes(userRecipesData);
        }
        
      } catch (err) {
        setError(err.message || 'Terjadi kesalahan saat memuat data');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, [isLoggedIn]);
  
  // Handle scroll
  const handleScroll = (direction, scrollRef) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };
  
  // Handle category click - menggunakan RecipeAPI
  const handleCategoryClick = async (categoryName) => {
    try {
      setLoading(true);
      const result = await RecipeAPI.getRecipesByCategory(categoryName, {
        page: 1,
        limit: 12
      });
      
      console.log('Category recipes:', result);
      // Handle category recipes (misalnya navigate ke halaman kategori atau update state)
      // Anda bisa menggunakan router untuk navigate atau update state untuk menampilkan hasil
      
    } catch (error) {
      console.error('Error fetching category recipes:', error);
      setError('Gagal memuat resep kategori');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle search - menggunakan RecipeAPI
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
      // Handle search results
      // Anda bisa navigate ke halaman search results atau update state
      
    } catch (error) {
      console.error('Error searching recipes:', error);
      setError('Gagal mencari resep');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle enter key in search
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };
  
  // Handle recipe click - menggunakan RecipeAPI
  const handleRecipeClick = async (recipeId) => {
    try {
      console.log('Loading recipe detail for:', recipeId);
      // Anda bisa navigate ke halaman detail atau load detail di modal
      // const recipeDetail = await RecipeAPI.getRecipeById(recipeId);
      // console.log('Recipe detail:', recipeDetail);
    } catch (error) {
      console.error('Error loading recipe detail:', error);
    }
  };
  
  // Recipe Section Component
  const RecipeImage = ({ src, alt, className, onLoad, onError }) => {
  const [imageState, setImageState] = useState('loading'); // 'loading', 'loaded', 'error'
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleImageLoad = (e) => {
    setImageState('loaded');
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e) => {
    console.log('Image failed to load:', currentSrc);
    
    // Coba beberapa fallback strategy
    if (currentSrc.includes('https://')) {
      // Coba tanpa https
      const newSrc = currentSrc.replace('https://', 'http://');
      setCurrentSrc(newSrc);
      console.log('Trying HTTP version:', newSrc);
    } else if (currentSrc.includes('http://')) {
      // Coba dengan protocol-relative URL
      const newSrc = currentSrc.replace('http://', '//');
      setCurrentSrc(newSrc);
      console.log('Trying protocol-relative version:', newSrc);
    } else {
      // Semua fallback gagal, gunakan placeholder
      setImageState('error');
      if (onError) onError(e);
    }
  };

  if (imageState === 'error') {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100`}>
        <div className="text-center">
          <div className="text-4xl mb-2">🍽️</div>
          <div className="text-xs text-gray-500">Gambar tidak tersedia</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {imageState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="text-4xl opacity-50">🍽️</div>
        </div>
      )}
    </div>
  );
};

// Recipe Section Component dengan tampilan berbeda berdasarkan section type
const RecipeSection = ({ title, recipes, icon, sectionType }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Function untuk handle scroll
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Lebar card + gap
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Function untuk handle click recipe dan navigate ke detail page
  const handleRecipeClick = (recipeId) => {
    navigate(`/resep/${recipeId}`);
  };

  // Tentukan apakah menggunakan gambar atau tidak berdasarkan section type
  const showImage = sectionType === 'banyakDisukai';
  
  // Tentukan grid layout untuk section tertentu
  const isGridLayout = sectionType === 'topMenuHemat' || sectionType === 'topAndalan';

  // Render card untuk section dengan gambar (Banyak Disukai)
  const renderImageCard = (recipe, index) => {
    // Debug: log data recipe untuk memastikan struktur data
    console.log('Recipe data for image card:', recipe);
    console.log('Image URL:', recipe['Image URL']);
    
    return (
      <div 
        key={recipe.item_id || recipe._id || index} 
        className="flex-none w-80 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105 transform"
        onClick={() => handleRecipeClick(recipe.item_id || recipe._id)}
      >
        {/* Image Section */}
        <div className="aspect-video bg-gray-200 overflow-hidden">
          <RecipeImage
            src={recipe['Image URL']}
            alt={recipe['Title Cleaned'] || 'Recipe'}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onLoad={() => console.log('Image loaded successfully:', recipe['Image URL'])}
            onError={() => console.log('All image fallbacks failed for:', recipe['Image URL'])}
          />
        </div>

        {/* Content Section */}
        <div className="p-6">
          {/* Title */}
          <h3 className="font-bold text-xl mb-4 line-clamp-2 text-gray-800">
            {recipe['Title Cleaned'] || recipe.Title || 'Judul tidak tersedia'}
          </h3>
          
          {/* Category */}
          <div className="mb-3">
            <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
              {recipe.Category || 'Kategori'}
            </span>
          </div>

          {/* Recipe Info */}
          <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
            <span className="flex items-center gap-1">
              <span className="text-base">🥘</span>
              {recipe['Total Ingredients'] || 0} bahan
            </span>
            <span className="flex items-center gap-1">
              <span className="text-base">📝</span>
              {recipe['Total Steps'] || 0} langkah
            </span>
          </div>

          {/* Rating - PERBAIKAN DI SINI */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="text-lg font-semibold text-gray-700">
              {/* Cek berbagai kemungkinan field rating */}
              {recipe.total_rating 
                ? (typeof recipe.total_rating === 'number' ? recipe.total_rating.toFixed(1) : recipe.total_rating)
                : recipe.rating 
                  ? (typeof recipe.rating === 'number' ? recipe.rating.toFixed(1) : recipe.rating)
                  : recipe.Rating
                    ? (typeof recipe.Rating === 'number' ? recipe.Rating.toFixed(1) : recipe.Rating)
                    : 'N/A'
              }
            </span>
          </div>

          {/* Action Button */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Lihat Resep
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render card tanpa gambar (Top Menu Hemat & Top Andalan)
  const renderSimpleCard = (recipe, index) => {
    // Debug: log data recipe untuk memastikan struktur data
    console.log('Recipe data for simple card:', recipe);
    
    return (
      <div 
        key={recipe._id || recipe.item_id || index} 
        className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform p-6 ${
          isGridLayout ? 'w-full' : 'flex-none w-80'
        }`}
        onClick={() => handleRecipeClick(recipe._id || recipe.item_id)}
      >
        {/* Default Image Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl mb-4 line-clamp-2 text-gray-800 text-center">
          {recipe.Title || recipe['Title Cleaned'] || 'Judul tidak tersedia'}
        </h3>
        
        {/* Category */}
        <div className="mb-3 text-center">
          <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
            {recipe.Category || 'Kategori'}
          </span>
        </div>

        {/* Rating - PERBAIKAN DI SINI JUGA */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-yellow-500 text-lg">⭐</span>
          <span className="text-lg font-semibold text-gray-700">
            {recipe.Rating 
              ? (typeof recipe.Rating === 'number' ? recipe.Rating.toFixed(1) : recipe.Rating)
              : recipe.total_rating 
                ? (typeof recipe.total_rating === 'number' ? recipe.total_rating.toFixed(1) : recipe.total_rating)
                : recipe.rating
                  ? (typeof recipe.rating === 'number' ? recipe.rating.toFixed(1) : recipe.rating)
                  : 'N/A'
            }
          </span>
        </div>

        {/* Complexity */}
        {recipe.Complexity && (
          <div className="text-center mb-4">
            <span className="inline-block bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded-full">
              {recipe.Complexity}
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
            Lihat Resep
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto">
        {/* Header dengan navigation buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">{icon}</span>
            {title}
          </h2>
          {!isGridLayout && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleScroll('left')}
                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {!recipes || recipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada resep tersedia</p>
          </div>
        ) : isGridLayout ? (
          // Grid Layout untuk Top Menu Hemat & Top Andalan
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe, index) => renderSimpleCard(recipe, index))}
          </div>
        ) : (
          // Horizontal Scroll Layout untuk Banyak Disukai
          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {recipes.map((recipe, index) => 
              showImage ? renderImageCard(recipe, index) : renderSimpleCard(recipe, index)
            )}
          </div>
        )}
      </div>

      {/* Custom CSS untuk hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};


  // Categories Section Component
  const CategoriesSection = () => (
    <section className="py-8 px-6 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Kategori Resep</h2>
        
        {!categories || categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Kategori tidak tersedia</p>
          </div>
        ) : (
          <div className="relative">
            <div 
              ref={categoryScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((category, index) => (
                <div
                  key={category.id || category._id || index}
                  className="flex-shrink-0 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-[150px]"
                  onClick={() => handleCategoryClick(category.name || category.nama)}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">
                      {category.icon || category.emoji || '🍽️'}
                    </div>
                    <h3 className="font-semibold text-gray-800">
                      {category.name || category.nama}
                    </h3>
                    {category.count && (
                      <p className="text-sm text-gray-500 mt-1">
                        {category.count} resep
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scroll buttons */}
            <button
              onClick={() => handleScroll('left', categoryScrollRef)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
            >
              ←
            </button>
            <button
              onClick={() => handleScroll('right', categoryScrollRef)}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
            >
              →
            </button>
          </div>
        )}
      </div>
    </section>
  );
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              window.location.reload();
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Hero Section */}
      <section className="bg-red-600 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute top-4 right-4 w-16 h-16 bg-orange-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-yellow-400 rounded-full opacity-20"></div>
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center gap-x-10">
          <div className="lg:w-[45%] text-center lg:text-left mb-12 lg:mb-0">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {isLoggedIn ? "Welcome back to We're Cooked" : "Welcome to We're Cooked"}
            </h1>
            <p className="text-lg lg:text-xl mb-6 opacity-90">
              {isLoggedIn 
                ? `Selamat datang, ${userName}! Temukan resep yang cocok untuk Anda`
                : 'Teman setia anak kost - Masak enak dari bahan seadanya'
              }
            </p>
            <div className="relative max-w-md mx-auto lg:mx-0">
              <input
                type="text"
                placeholder="Cari resep..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                className="w-full py-3 px-4 pr-12 rounded-full bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg"
              />
              <button
                onClick={() => handleSearch(searchTerm)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="lg:w-[45%] flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <img
                  src={food}
                  alt="Asian Cuisine"
                  className="w-72 h-72 lg:w-80 lg:h-80 rounded-full object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Kategori</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => handleScroll('left', categoryScrollRef)}
                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleScroll('right', categoryScrollRef)}
                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div
            ref={categoryScrollRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <div 
                key={category.id || index} 
                className="flex-none w-80 bg-red-600 text-white p-8 rounded-2xl text-center hover:bg-red-700 transition-all duration-300 cursor-pointer hover:scale-105 transform"
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold mb-3">{category.name}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{category.description}</p>
                {category.count !== undefined && (
                  <div className="mt-2 text-xs opacity-75">
                    {category.count} resep tersedia
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Conditional Recipe Sections */}
      {!isLoggedIn ? (
        <>
          <RecipeSection 
            title="Top Menu Hemat" 
            recipes={guestRecipes.topMenuHemat} 
            icon="💰" 
          />
          <RecipeSection 
            title="Banyak Disukai" 
            recipes={guestRecipes.banyakDisukai} 
            icon="❤️" 
          />
          <RecipeSection 
            title="Top Andalan" 
            recipes={guestRecipes.topAndalan} 
            icon="⭐" 
          />
        </>
      ) : (
        <>
          <RecipeSection 
            title="Untuk Kamu" 
            recipes={userRecipes.untukKamu} 
            icon="🎯" 
          />
          <RecipeSection 
            title="Preferensi Sama" 
            recipes={userRecipes.preferensiSama} 
            icon="👥" 
          />
          <RecipeSection 
            title="Top Werecooked" 
            recipes={userRecipes.topWerecooked} 
            icon="🏆" 
          />
        </>
      )}
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default HomeView;