// src/components/category/CategoriesSection.jsx
import React, { useRef } from 'react';
import CategoryCard from './CategoryCard';
import { scrollUtils } from '../../utils/scrollUtils';

const CategoriesSection = ({ categories, onCategoryClick }) => {
  const categoryScrollRef = useRef(null);

  const handleScroll = (direction) => {
    scrollUtils.handleScroll(direction, categoryScrollRef);
  };

  if (!categories || categories.length === 0) {
    return (
      <section className="py-8 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Kategori Resep</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Kategori tidak tersedia</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-6 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Kategori Resep</h2>
        
        <div className="relative">
          <div 
            ref={categoryScrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id || category._id || index}
                category={category}
                onClick={onCategoryClick}
              />
            ))}
          </div>
          
          {/* Scroll buttons */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
          >
            ←
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;