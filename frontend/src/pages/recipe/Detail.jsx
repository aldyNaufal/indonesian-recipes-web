// src/components/Detail.jsx atau Detail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadRecipeDetail } from '../../utils/recipeService'; // Pastikan path benar
import RecipeImage from '../../components/recipe/RecipeImage';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching recipe with ID:', id);
        
        // Debug: Cek apakah loadRecipeDetail function tersedia
        console.log('loadRecipeDetail function:', loadRecipeDetail);
        
        const recipeData = await loadRecipeDetail(id);
        console.log('Recipe loaded:', recipeData);
        
        setRecipe(recipeData);
      } catch (err) {
        console.error('Error loading recipe:', err);
        setError(err.message || 'Gagal memuat detail resep');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    } else {
      setError('Recipe ID not provided');
      setLoading(false);
    }
  }, [id]);

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
    // Parse dari database
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
    
    // Hapus prefix "step n"
    return steps.map(step => step.replace(/^step\s+\d+\s*/i, ''));
  };

  const parseIngredients = (ingredientsString) => {
    if (!ingredientsString) return [];
    
    return ingredientsString
      .split(',')                    // Pisah berdasarkan koma
      .map(ingredient => ingredient.trim())  // Hilangkan spasi di awal/akhir
      .filter(ingredient => ingredient.length > 0);  // Hilangkan string kosong
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header dengan tombol kembali */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Title Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 text-center">
              {recipe['Title Cleaned'] || 'Judul tidak tersedia'}
            </h1>
          </div>

          {/* Main Content Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Image and Rating */}
            <div className="space-y-6">
              {/* Image Section */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {optimizedImageUrl && !imageError ? (
                  <div className="aspect-[4/3] bg-gray-200 overflow-hidden">
                    <RecipeImage
                      src={optimizedImageUrl}
                      alt={recipe['Title Cleaned']}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                      fallbackSrc={recipe['Image URL']}
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-2">🍽️</div>
                      <div className="text-gray-600">No Image Available</div>
                    </div>
                  </div>
                )}
                
                {/* Rating Section */}
                <div className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-full">
                      <span className="text-yellow-500 text-2xl mr-2">⭐</span>
                      <span className="text-2xl font-bold text-gray-800">
                        {getRating(recipe)}
                      </span>
                      <span className="text-gray-600 ml-1">/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Steps and Content */}
            <div className="space-y-6">
              {/* Steps Section */}
              {steps.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                    <span className="mr-2">📝</span>
                    Langkah-langkah Pembuatan
                  </h2>
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <span className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold mr-4 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-gray-700 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bahan-bahan Section */}
              {ingredients.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                    <span className="mr-2">🥘</span>
                    Bahan-bahan
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {parseIngredients(ingredients).map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  Informasi Tambahan
                </h2>
                <div className="space-y-4">
                  {/* Category */}
                  {recipe.Category && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Kategori:</span>
                      <span className="bg-red-100 text-red-600 text-sm font-medium px-3 py-1 rounded-full">
                        {recipe.Category}
                      </span>
                    </div>
                  )}
                  
                  {/* Total Steps */}
                  {recipe['Total Steps'] && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Total Langkah:</span>
                      <span className="bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1 rounded-full">
                        {recipe['Total Steps']} langkah
                      </span>
                    </div>
                  )}
                  
                  {/* Total Ingredients */}
                  {recipe['Total Ingredients'] && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Total Bahan:</span>
                      <span className="bg-green-100 text-green-600 text-sm font-medium px-3 py-1 rounded-full">
                        {recipe['Total Ingredients']} bahan
                      </span>
                    </div>
                  )}
                  
                  {/* Full Recipe Link */}
                  {recipe.URL && (
                    <div className="pt-4">
                      <a 
                        href={recipe.URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center font-medium"
                      >
                        <span className="mr-2">🔗</span>
                        Lihat Resep Lengkap
                      </a>
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