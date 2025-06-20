// src/components/recipe/RecipeCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeImage from './RecipeImage';

const RecipeCard = ({ 
  recipe, 
  index, 
  cardType = 'image', // 'image' | 'simple'
  isGridLayout = false 
}) => {
  const navigate = useNavigate();

  const handleRecipeClick = (recipeId) => {
    navigate(`/resep/${recipeId}`);
  };

  const getRating = (recipe) => {
    const rating = recipe.total_rating || recipe.rating || recipe.Rating;
    if (!rating) return 'N/A';
    return typeof rating === 'number' ? rating.toFixed(1) : rating;
  };

  // Card dengan gambar
  if (cardType === 'image') {
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
          />
        </div>
        
        {/* Content Section */}
        <div className="p-6">
          <h3 className="font-bold text-xl mb-4 line-clamp-2 text-gray-800">
            {recipe['Title Cleaned'] || recipe.Title || 'Judul tidak tersedia'}
          </h3>
          
          <div className="mb-3">
            <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
              {recipe.Category || 'Kategori'}
            </span>
          </div>
          
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
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="text-lg font-semibold text-gray-700">
              {getRating(recipe)}
            </span>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
              Lihat Resep
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Card sederhana tanpa gambar
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
      
      <h3 className="font-bold text-xl mb-4 line-clamp-2 text-gray-800 text-center">
        {recipe.Title || recipe['Title Cleaned'] || 'Judul tidak tersedia'}
      </h3>
      
      <div className="mb-3 text-center">
        <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
          {recipe.Category || 'Kategori'}
        </span>
      </div>
      
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-yellow-500 text-lg">⭐</span>
        <span className="text-lg font-semibold text-gray-700">
          {getRating(recipe)}
        </span>
      </div>
      
      {recipe.Complexity && (
        <div className="text-center mb-4">
          <span className="inline-block bg-green-100 text-green-600 text-xs font-medium px-2 py-1 rounded-full">
            {recipe.Complexity}
          </span>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium">
          Lihat Resep
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;