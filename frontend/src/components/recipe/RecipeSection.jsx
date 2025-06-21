// src/components/recipe/RecipeSection.jsx
import React, { useRef } from 'react';
import RecipeCard from './RecipeCard';
import ScrollButton from '../common/ScrollButton';

const RecipeSection = ({ title, recipes, icon, sectionType }) => {
  const scrollRef = useRef(null);
  
  // PERBAIKAN: Konfigurasi berdasarkan section type
  // Semua section akan menampilkan gambar jika URL tersedia
  const showImage = true; // Ubah dari: sectionType === 'banyakDisukai'
  const isGridLayout = sectionType === 'topMenuHemat' || sectionType === 'topAndalan';
  
  // Debug logging untuk melihat konfigurasi
  React.useEffect(() => {
    console.log('🔧 RecipeSection Config:', {
      sectionType,
      showImage,
      isGridLayout,
      recipesCount: recipes?.length || 0
    });
  }, [sectionType, showImage, isGridLayout, recipes]);
  
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

  if (!recipes || recipes.length === 0) {
    return (
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3 mb-8">
            <span className="text-4xl">{icon}</span>
            {title}
          </h2>
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada resep tersedia</p>
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
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="text-4xl">{icon}</span>
            {title}
          </h2>
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
              // PERBAIKAN: Tetap coba tampilkan gambar jika URL tersedia
              const hasImageUrl = recipe['Image URL'];
              const cardType = hasImageUrl ? 'image' : 'simple';
              
              console.log('🎯 Grid Card:', {
                index,
                hasImageUrl,
                cardType,
                title: recipe['Title Cleaned'] || recipe.Title
              });
              
              return (
                <RecipeCard 
                  key={recipe._id || recipe.item_id || index}
                  recipe={recipe} 
                  index={index} 
                  cardType={cardType} // Dinamis berdasarkan URL
                  isGridLayout={true}
                />
              );
            })}
          </div>
        ) : (
          // Horizontal Scroll Layout untuk Banyak Disukai
          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {recipes.map((recipe, index) => {
              // PERBAIKAN: Dinamis berdasarkan URL gambar
              const hasImageUrl = recipe['Image URL'];
              const cardType = hasImageUrl && showImage ? 'image' : 'simple';
              
              console.log('🎯 Scroll Card:', {
                index,
                hasImageUrl,
                showImage,
                cardType,
                title: recipe['Title Cleaned'] || recipe.Title
              });
              
              return (
                <RecipeCard 
                  key={recipe._id || recipe.item_id || index}
                  recipe={recipe} 
                  index={index} 
                  cardType={cardType} // Dinamis berdasarkan URL
                  isGridLayout={false}
                />
              );
            })}
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

export default RecipeSection;