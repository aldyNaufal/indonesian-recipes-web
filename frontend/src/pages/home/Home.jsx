import React, { useState, useEffect, useRef } from 'react';
import food from '../../assets/cook.png'; // Pastikan path ini benar

// Components
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SearchBar from '../../components/search/SearchBar';
import ScrollButton from '../../components/common/ScrollButton';
import CategoriesSection from '../../components/category/CategoriesSection';
import RecipeSection from '../../components/recipe/RecipeSection';

// Custom Hooks
import { useAuth } from '../../context/AuthContext';
import { useRecipes } from '../../hooks/useRecipes';
import { useCategories } from '../../hooks/useCategories';

// ML Service
import mlApiService from '../../services/apiService';

const Home = () => {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [mlHealthStatus, setMlHealthStatus] = useState(null);
  const [showMLDebug, setShowMLDebug] = useState(process.env.NODE_ENV === 'development');
  
  // Refs
  const categoryScrollRef = useRef(null);
  
  // Custom Hooks
  const { isAuthenticated, user } = useAuth();
  const isLoggedIn = isAuthenticated;
  const userName = user?.name || user?.username || '';
  
  const { 
    guestRecipes, 
    userRecipes, 
    loading: recipesLoading, 
    mlLoading,
    error: recipesError,
    mlError,
    handleSearch,
    reloadRecipes,
    retryMLRecommendations,
    hasMLRecommendations,
    debugInfo
  } = useRecipes(isLoggedIn, user);
  
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
    handleCategoryClick,
    reloadCategories
  } = useCategories();

  // Combined loading state
  const loading = recipesLoading || categoriesLoading;
  const error = recipesError || categoriesError;

  // Check ML service health on mount
  useEffect(() => {
    const checkMLHealth = async () => {
      if (isLoggedIn) {
        try {
          await mlApiService.checkHealth();
          setMlHealthStatus('healthy');
        } catch (error) {
          console.warn('ML service health check failed:', error);
          setMlHealthStatus('unhealthy');
        }
      }
    };

    checkMLHealth();
  }, [isLoggedIn]);

  // Handle retry for errors
  const handleRetry = () => {
    reloadRecipes();
    reloadCategories();
  };

  // Handle ML retry specifically
  const handleMLRetry = async () => {
    try {
      await retryMLRecommendations();
      setMlHealthStatus('healthy');
    } catch (error) {
      console.error('ML retry failed:', error);
      setMlHealthStatus('unhealthy');
    }
  };

  // Handle search submission
  const handleSearchSubmit = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    const results = await handleSearch(searchQuery.trim());
    if (results) {
      // Handle search results (navigate to search page or show results)
      console.log('Search completed:', results);
    }
  };

  // Handle horizontal scroll for categories
  const handleScroll = (direction, scrollRef) => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one category card + gap
      const currentScroll = scrollRef.current.scrollLeft;
      
      if (direction === 'left') {
        scrollRef.current.scrollTo({
          left: currentScroll - scrollAmount,
          behavior: 'smooth'
        });
      } else {
        scrollRef.current.scrollTo({
          left: currentScroll + scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  // ML Status Indicator Component


  // ML Error Banner Component
  const MLErrorBanner = () => {
    if (!isLoggedIn || !mlError) return null;

    return (
      <div className="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-orange-700">
              <strong>Rekomendasi Personal Tidak Tersedia:</strong> {mlError}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Menampilkan resep populer sebagai alternatif.
            </p>
            <button
              onClick={handleMLRetry}
              className="mt-2 text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Welcome Message with ML Status
  const getWelcomeMessage = () => {
    if (!isLoggedIn) {
      return 'Teman setia anak kost - Masak enak dari bahan seadanya';
    }

    if (mlLoading) {
      return `Selamat datang, ${userName}! Kami sedang menyiapkan rekomendasi khusus untuk Anda...`;
    }

    if (hasMLRecommendations) {
      return `Selamat datang, ${userName}! Rekomendasi personal telah disiapkan untuk Anda`;
    }

    return `Selamat datang, ${userName}! Temukan resep yang cocok untuk Anda`;
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Memuat data..." />;
  }

  // Error state
  if (error) {
    return <ErrorMessage error={error} onRetry={handleRetry} />;
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
              {getWelcomeMessage()}
            </p>
            {/* ML Loading Indicator in Hero */}
            {isLoggedIn && mlLoading && (
              <div className="mb-4 flex items-center justify-center lg:justify-start gap-2 text-sm opacity-75">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Menyiapkan rekomendasi personal...</span>
              </div>
            )}
            <div className="max-w-md mx-auto lg:mx-0 hero-search">
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={handleSearchSubmit}
                placeholder="Cari resep..."
              />
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

      {/* Main Content Container */}
      <div className="container mx-auto px-6">
        {/* ML Error Banner */}
        <MLErrorBanner />
        
        {/* Categories Section */}
        <section className="py-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Kategori</h2>
            <div className="flex space-x-2">
              <ScrollButton
                direction="left"
                onClick={() => handleScroll('left', categoryScrollRef)}
              />
              <ScrollButton
                direction="right"
                onClick={() => handleScroll('right', categoryScrollRef)}
              />
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
        </section>
        
        {/* Recipe Sections */}
        {/* Recipe Sections */}
        {!isLoggedIn ? (
          // Guest User Sections
          <>
            <RecipeSection 
              title="Top Menu Hemat" 
              recipes={guestRecipes.topMenuHemat} 
              sectionType="topMenuHemat"
              icon="💰"
              loading={recipesLoading}
            />
            <RecipeSection 
              title="Banyak Disukai" 
              recipes={guestRecipes.banyakDisukai} 
              sectionType="banyakDisukai"
              icon="❤️"
              loading={recipesLoading}
            />
            <RecipeSection 
              title="Top Andalan" 
              recipes={guestRecipes.topAndalan} 
              sectionType="topAndalan"
              icon="⭐"
              loading={recipesLoading}
            />
            
            {/* Login CTA */}
            <section className="py-16">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-8 rounded-2xl text-center">
                <h3 className="text-2xl font-bold mb-4">Dapatkan Rekomendasi Personal!</h3>
                <p className="text-lg mb-6 opacity-90">
                  Masuk untuk mendapatkan rekomendasi resep yang disesuaikan dengan preferensi dan riwayat masakan Anda
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 text-sm">
                    <span>🤖</span>
                    <span>AI-powered recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>📊</span>
                    <span>Berdasarkan preferensi Anda</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>⚡</span>
                    <span>Update real-time</span>
                  </div>
                </div>
                <button className="mt-6 bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-red-50 transition-colors">
                  Masuk Sekarang
                </button>
              </div>
            </section>
          </>
        ) : (
          // Logged-in User Sections with ML
          <>
            {hasMLRecommendations ? (
              // ML Recommendations Available
              <>
                <RecipeSection 
                  title="Khusus Untuk Kamu" 
                  recipes={userRecipes.untukKamu} 
                  sectionType="untukKamu"
                  icon="🎯"
                  loading={mlLoading}
                  subtitle="Berdasarkan riwayat dan preferensi Anda"
                />
                <RecipeSection 
                  title="Sesuai Selera Kamu" 
                  recipes={userRecipes.preferensiSama} 
                  sectionType="preferensiSama"
                  icon="👥"
                  loading={mlLoading}
                  subtitle="Orang dengan selera sama juga menyukai ini"
                />
                <RecipeSection 
                  title="Top WeRecooked" 
                  recipes={guestRecipes.banyakDisukai} 
                  sectionType="topWerecooked"
                  icon="🏆"
                  loading={recipesLoading}
                  subtitle="Favorit komunitas kami"
                />
              </>
            ) : (
              // Fallback to Guest Recipes with Loading Overlay
              <>
                {mlLoading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <div>
                        <p className="text-blue-800 font-medium">Menyiapkan rekomendasi personal Anda...</p>
                        <p className="text-blue-600 text-sm">Menampilkan resep populer sementara kami memproses preferensi Anda</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <RecipeSection 
                  title="Menu Hemat" 
                  recipes={guestRecipes.topMenuHemat} 
                  sectionType="topMenuHemat"
                  icon="💰"
                  loading={recipesLoading}
                  subtitle={mlLoading ? "Rekomendasi personal sedang disiapkan..." : undefined}
                />
                <RecipeSection 
                  title="Banyak Disukai" 
                  recipes={guestRecipes.banyakDisukai} 
                  sectionType="banyakDisukai"
                  icon="❤️"
                  loading={recipesLoading}
                />
                <RecipeSection 
                  title="Top Andalan" 
                  recipes={guestRecipes.topAndalan} 
                  sectionType="topAndalan"
                  icon="⭐"
                  loading={recipesLoading}
                />
              </>
            )}
          </>
        )}
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        /* Custom styling for SearchBar in hero section */
        .hero-search input {
          background: white !important;
          color: #374151 !important;
          border: none !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          padding: 12px 16px 12px 40px !important;
        }
        .hero-search input::placeholder {
          color: #6b7280 !important;
        }
        .hero-search input:focus {
          ring-color: #fb923c !important;
          border-color: transparent !important;
        }
        .hero-search .lucide-search {
          color: #dc2626 !important;
        }
      `}</style>
    </div>
  );
};

export default Home;