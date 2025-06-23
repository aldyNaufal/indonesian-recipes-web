// src/components/recipe/RecipeCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeImage from './RecipeImage';

const RecipeCard = ({ 
  recipe, 
  index, 
  cardType = 'auto',
  isGridLayout = false 
}) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // PERBAIKAN: Normalize data structure untuk handle perbedaan ML vs Guest response
  const normalizeRecipeData = (recipe) => {
    // Helper function untuk mendapatkan nilai dari berbagai kemungkinan field names
    const getFieldValue = (obj, possibleFields) => {
      for (const field of possibleFields) {
        if (obj[field] !== undefined && obj[field] !== null) {
          return obj[field];
        }
      }
      return null;
    };

    return {
      // ID fields
      id: getFieldValue(recipe, ['item_id', 'id', '_id']),
      
      // Title fields - ML response menggunakan 'title_cleaned'
      title: getFieldValue(recipe, ['title_cleaned', 'Title Cleaned', 'Title', 'title']),
      
      // Image fields - ML response menggunakan 'image_url'
      imageUrl: getFieldValue(recipe, ['image_url', 'Image URL', 'imageUrl', 'image']),
      
      // Category fields
      category: getFieldValue(recipe, ['category', 'Category']),
      
      // Rating fields - ML response menggunakan 'total_rating' dan 'predicted_rating'
      rating: getFieldValue(recipe, ['total_rating', 'predicted_rating', 'rating', 'Rating']),
      
      // Complexity/Difficulty fields
      complexity: getFieldValue(recipe, ['difficulty_level', 'Complexity', 'complexity']),
      
      // Ingredients
      ingredients: getFieldValue(recipe, ['ingredients_cleaned', 'Ingredients', 'ingredients']),
      
      // Steps
      steps: getFieldValue(recipe, ['steps_cleaned', 'Steps', 'steps'])
    };
  };

  // Normalize recipe data
  const normalizedRecipe = normalizeRecipeData(recipe);

  // Debug logging untuk melihat data normalization
  React.useEffect(() => {
    console.log('🔄 Recipe Data Normalization:', {
      original: recipe,
      normalized: normalizedRecipe,
      hasImage: !!normalizedRecipe.imageUrl
    });
  }, [recipe]);

  // AUTO-DETECT: Tentukan cardType berdasarkan ketersediaan gambar
  const actualCardType = cardType === 'auto' 
    ? (normalizedRecipe.imageUrl ? 'image' : 'simple')
    : cardType;

  const handleRecipeClick = () => {
    const recipeId = normalizedRecipe.id;
    if (recipeId) {
      navigate(`/resep/${recipeId}`);
    } else {
      console.error('Recipe ID not found:', recipe);
    }
  };

  // Fungsi untuk mengubah teks menjadi Title Case
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
  
  const getRating = (rating) => {
    if (!rating) return 'N/A';
    // Handle ML predicted_rating yang berupa float
    if (typeof rating === 'number') {
      return rating.toFixed(1);
    }
    return rating;
  };

  const handleImageLoad = () => {
    console.log('✅ RecipeCard: Image loaded successfully');
    setImageError(false);
  };

  const handleImageError = () => {
    console.log('❌ RecipeCard: Image failed to load');
    setImageError(true);
  };

  // Fungsi optimasi URL yang lebih robust
  const getOptimizedImageUrl = (originalUrl) => {
    if (!originalUrl) return null;
    
    try {
      // Validasi URL
      const url = new URL(originalUrl);
      
      // Hindari double encoding
      if (originalUrl.includes('wsrv.nl')) {
        return originalUrl;
      }
      
      // Gunakan wsrv.nl untuk optimasi
      const optimizedUrl = `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=680&h=400&fit=cover&output=webp`;
      
      console.log('🖼️ Image URL optimization:', {
        original: originalUrl,
        optimized: optimizedUrl
      });
      
      return optimizedUrl;
    } catch (error) {
      console.error('Invalid image URL:', originalUrl, error);
      return originalUrl;
    }
  };

  // Card dengan gambar
  if (actualCardType === 'image') {
    const optimizedImageUrl = getOptimizedImageUrl(normalizedRecipe.imageUrl);
    
    return (
      <div 
        key={normalizedRecipe.id || index} 
        className="flex-none w-80 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer hover:scale-105 transform"
        onClick={handleRecipeClick}
      >
        {/* Image Section */}
        <div className="aspect-video bg-gray-200 overflow-hidden relative">
          {optimizedImageUrl && !imageError ? (
            <RecipeImage
              src={optimizedImageUrl}
              alt={normalizedRecipe.title || 'Recipe'}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              onLoad={handleImageLoad}
              onError={handleImageError}
              fallbackSrc={normalizedRecipe.imageUrl} // Gunakan original sebagai fallback
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
              <div className="text-center">
                <div className="text-4xl mb-2">🍽️</div>
                <div className="text-xs text-gray-600">
                  {!normalizedRecipe.imageUrl ? 'No Image Available' : 'Image Failed to Load'}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Content Section */}
        <div className="p-6">
          <h3 className="font-bold text-xl mb-4 line-clamp-2 text-gray-800">
            {toTitleCase(normalizedRecipe.title || 'Judul tidak tersedia')}
          </h3>
          
          <div className="mb-3">
            <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
              {normalizedRecipe.category || 'Kategori'}
            </span>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="text-lg font-semibold text-gray-700">
              {getRating(normalizedRecipe.rating)}
            </span>
          </div>
          
          {/* Tambahan info untuk ML recommendations */}
          {normalizedRecipe.complexity && (
            <div className="mb-3 text-center">
              <span className="inline-block bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
                {normalizedRecipe.complexity}
              </span>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button 
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
              onClick={(e) => {
                e.stopPropagation();
                handleRecipeClick();
              }}
            >
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
      key={normalizedRecipe.id || index} 
      className={`bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 transform p-6 ${
        isGridLayout ? 'w-full' : 'flex-none w-80'
      }`}
      onClick={handleRecipeClick}
    >
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          <span className="text-2xl">🍽️</span>
        </div>
      </div>
      
      <h3 className="font-bold text-xl mb-4 line-clamp-2 text-gray-800 text-center">
        {toTitleCase(normalizedRecipe.title || 'Judul tidak tersedia')}
      </h3>
      
      <div className="mb-3 text-center">
        <span className="inline-block bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
          {normalizedRecipe.category || 'Kategori'}
        </span>
      </div>
      
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-yellow-500 text-lg">⭐</span>
        <span className="text-lg font-semibold text-gray-700">
          {getRating(normalizedRecipe.rating)}
        </span>
      </div>
      
      {normalizedRecipe.complexity && (
        <div className="text-center mb-4">
          <span className="inline-block bg-blue-100 text-blue-600 text-xs font-medium px-2 py-1 rounded-full">
            {normalizedRecipe.complexity}
          </span>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-100">
        <button 
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
          onClick={(e) => {
            e.stopPropagation();
            handleRecipeClick();
          }}
        >
          Lihat Resep
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;