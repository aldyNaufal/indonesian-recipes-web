import React, { useState, useEffect, useRef } from 'react';
import food from '../assets/cook.png'; // Pastikan path ini benar

// Components
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import SearchBar from '../components/search/SearchBar';
import ScrollButton from '../components/common/ScrollButton';
import CategoriesSection from '../components/category/CategoriesSection';
import RecipeSection from '../components/recipe/RecipeSection';

// Custom Hooks
import { useAuth } from '../hooks/useAuth';
import { useRecipes } from '../hooks/useRecipes';
import { useCategories } from '../hooks/useCategories';

const HomeView = () => {
  // States
  const [searchTerm, setSearchTerm] = useState('');
  
  // Refs
  const categoryScrollRef = useRef(null);
  
  // Custom Hooks
  const { isLoggedIn, userName } = useAuth();
  const { 
    guestRecipes, 
    userRecipes, 
    loading: recipesLoading, 
    error: recipesError,
    handleSearch,
    reloadRecipes
  } = useRecipes(isLoggedIn);
  
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

  // Handle retry for errors
  const handleRetry = () => {
    reloadRecipes();
    reloadCategories();
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
              {isLoggedIn 
                ? `Selamat datang, ${userName}! Temukan resep yang cocok untuk Anda`
                : 'Teman setia anak kost - Masak enak dari bahan seadanya'
              }
            </p>
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
      
      {/* Categories Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
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

export default HomeView;