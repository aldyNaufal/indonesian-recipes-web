// src/components/category/CategoryCard.jsx
import React from 'react';

const CategoryCard = ({ category, onClick }) => {
  return (
    <div
      className="flex-shrink-0 bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-[150px]"
      onClick={() => onClick(category.name || category.nama)}
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
  );
};

export default CategoryCard;