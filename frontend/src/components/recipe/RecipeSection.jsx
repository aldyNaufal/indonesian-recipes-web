// src/components/recipe/RecipeSection.jsx
import React, { useRef } from 'react';
import RecipeCard from './RecipeCard';
import ScrollButton from '../common/ScrollButton';

const RecipeSection = ({ title, recipes, icon, sectionType, subtitle, loading }) => {
  const scrollRef = useRef(null);
  
  // Konfigurasi berdasarkan section type
  const showImage = true; // Semua section akan menampilkan gambar jika URL tersedia
  const isGridLayout = null;
  
  // Debug logging untuk melihat data yang masuk
  React.useEffect(() => {
    console.log('🔧 RecipeSection Config:', {
      title,
      sectionType,
      showImage,
      isGridLayout,
      recipesCount: recipes?.length || 0,
      loading,
      sampleRecipe: recipes?.[0] ? {
        hasImageUrl: !!recipes[0]['Image URL'],
        hasImageUrlSnake: !!recipes[0]['image_url'],
        hasTitle: !!recipes[0]['Title Cleaned'],
        hasTitleSnake: !!recipes[0]['title_cleaned'],
        allKeys: Object.keys(recipes[0]).slice(0, 10) // Show first 10 keys
      } : null
    });
  }, [title, sectionType, showImage, isGridLayout, recipes, loading]);
  
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-8">
            <span className="text-4xl">{icon}</span>
            {title}
            {subtitle && <span className="text-sm text-gray-500 font-normal ml-2">{subtitle}</span>}
          </h2>
          
          {/* Loading skeleton */}
          <div className={isGridLayout ? 
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : 
            "flex space-x-6 overflow-hidden"
          }>
            {[...Array(isGridLayout ? 8 : 4)].map((_, index) => (
              <div key={index} className={`bg-gray-200 animate-pulse rounded-2xl ${isGridLayout ? 'h-80' : 'w-80 h-80'}`}>
                <div className="h-48 bg-gray-300 rounded-t-2xl"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (!recipes || recipes.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-8">
            <span className="text-4xl">{icon}</span>
            {title}
            {subtitle && <span className="text-sm text-gray-500 font-normal ml-2">{subtitle}</span>}
          </h2>
          <div className="text-center py-8 text-gray-500">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-lg">Belum ada resep tersedia</p>
            <p className="text-sm mt-2">Rekomendasi sedang disiapkan untuk Anda</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto">
        {/* Header dengan navigation buttons */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-4xl">{icon}</span>
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1 ml-12">{subtitle}</p>
            )}
          </div>
          {!isGridLayout && (
            <div className="flex space-x-2">
              <ScrollButton direction="left" onClick={() => handleScroll('left')} />
              <ScrollButton direction="right" onClick={() => handleScroll('right')} />
            </div>
          )}
        </div>
        
        {/* Content */}
        {isGridLayout ? (
          // Grid Layout untuk Top Menu Hemat & Top Andalan
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe, index) => {
              // Validasi recipe object
              if (!recipe || typeof recipe !== 'object') {
                console.warn('Invalid recipe object:', recipe);
                return null;
              }

              // Determine card type berdasarkan ketersediaan image
              const hasImageUrl = recipe['Image URL'] || recipe['image_url'];
              const cardType = hasImageUrl ? 'image' : 'simple';
              
              console.log('🎯 Grid Card:', {
                index,
                hasImageUrl: !!hasImageUrl,
                cardType,
                title: recipe['Title Cleaned'] || recipe['title_cleaned'] || recipe.Title,
                sectionType
              });
              
              return (
                <RecipeCard 
                  key={recipe.item_id || recipe.id || recipe._id || index}
                  recipe={recipe} 
                  index={index} 
                  cardType={cardType}
                  isGridLayout={true}
                />
              );
            })}
          </div>
        ) : (
          // Horizontal Scroll Layout untuk Banyak Disukai, Khusus Untuk Kamu, dll
          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {recipes.map((recipe, index) => {
              // Validasi recipe object
              if (!recipe || typeof recipe !== 'object') {
                console.warn('Invalid recipe object:', recipe);
                return null;
              }

              // Determine card type berdasarkan ketersediaan image
              const hasImageUrl = recipe['Image URL'] || recipe['image_url'];
              const cardType = hasImageUrl && showImage ? 'image' : 'simple';
              
              console.log('🎯 Scroll Card:', {
                index,
                hasImageUrl: !!hasImageUrl,
                showImage,
                cardType,
                title: recipe['Title Cleaned'] || recipe['title_cleaned'] || recipe.Title,
                sectionType
              });
              
              return (
                <RecipeCard 
                  key={recipe.item_id || recipe.id || recipe._id || index}
                  recipe={recipe} 
                  index={index} 
                  cardType={cardType}
                  isGridLayout={false}
                />
              );
            })}
          </div>
        )}
      </div>
      
      {/* Custom CSS untuk hide scrollbar */}
      <style>{`
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

export default RecipeSection;