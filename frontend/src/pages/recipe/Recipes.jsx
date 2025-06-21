import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Users, Loader2, Star, ChefHat, RefreshCw } from 'lucide-react';
import { publicApiGet } from '../../utils/httpClient';
import { useNavigate } from 'react-router-dom';



const Recipe = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [userIngredients, setUserIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('');
  const [minRating, setMinRating] = useState('');
  const [topN, setTopN] = useState(6);
  const [recommendations, setRecommendations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [apiMessage, setApiMessage] = useState('')
  const navigate = useNavigate();
  const [afterFilters, setAfterFilters] = useState(0);

  // API Configuration
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://werecooked.my.id' 
    : 'http://localhost:3000';

  // Predefined additional ingredients (non-main ingredients)
  const additionalIngredients = [
    { name: 'bawang merah', icon: '🧅' },
    { name: 'bawang putih', icon: '🧄' },
    { name: 'cabai', icon: '🌶️' },
    { name: 'cabai rawit', icon: '🌶️' },
    { name: 'cabai merah', icon: '🔴' },
    { name: 'tomat', icon: '🍅' },
    { name: 'wortel', icon: '🥕' },
    { name: 'kentang', icon: '🥔' },
    { name: 'brokoli', icon: '🥦' },
    { name: 'bayam', icon: '🥬' },
    { name: 'jagung', icon: '🌽' },
    { name: 'kacang panjang', icon: '🫘' },
    { name: 'santan', icon: '🥥' },
    { name: 'kecap manis', icon: '🍯' },
    { name: 'sambal', icon: '🔥' },
    { name: 'keju', icon: '🧀' },
    { name: 'susu', icon: '🥛' },
    { name: 'jahe', icon: '🫚' },
    { name: 'kunyit', icon: '🟡' },
    { name: 'kemiri', icon: '🌰' },
    { name: 'daun salam', icon: '🍃' },
    { name: 'serai', icon: '🌿' },
    { name: 'penyedap rasa', icon: '🧂' }
  ];

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      
      // Using the API helper instead of direct fetch
      const response = await publicApiGet('api/categories');
      
      // Debug: Log the response to see the actual structure
      console.log('Categories API response:', response);
      
      // Check if response exists
      if (!response) {
        throw new Error('No data received from API');
      }
      
      // Handle the actual response structure: { data: [...], error: false }
      let categoriesData;
      
      if (response.data && Array.isArray(response.data)) {
        // Response has { data: [...] } structure (this is your actual format)
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        // If response is directly an array
        categoriesData = response;
      } else if (response.categories && Array.isArray(response.categories)) {
        // If response has { categories: [...] } structure
        categoriesData = response.categories;
      } else if (response.categories && typeof response.categories === 'object') {
        // If response has { categories: {...} } structure (object)
        const categoryArray = Object.entries(response.categories).map(([key, value]) => ({
          name: value.name,
          icon: value.icon,
          description: value.description,
          count: value.count,
          key: key.toLowerCase()
        }));
        setCategories(categoryArray);
        return;
      } else {
        throw new Error('Invalid response format from categories API');
      }
      
      // Convert categories data to the format expected by frontend
      const categoryArray = categoriesData.map((category) => ({
        name: category.name,
        icon: category.icon,
        description: category.description,
        count: category.count,
        key: category.id ? category.id.toString().toLowerCase() : category.name.toLowerCase()
      }));
      
      console.log('Processed categories:', categoryArray); // Debug processed data
      setCategories(categoryArray);
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      console.error('Error details:', err);
      setError(err.message || 'Gagal mengambil data kategori');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle ingredient selection
  const handleIngredientChange = (ingredient) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  // Add user-typed ingredient
  const addUserIngredient = () => {
    const ingredient = ingredientInput.trim().toLowerCase();
    if (ingredient && !userIngredients.includes(ingredient)) {
      setUserIngredients(prev => [...prev, ingredient]);
      setIngredientInput('');
    }
  };

  // Remove user ingredient
  const removeUserIngredient = (ingredient) => {
    setUserIngredients(prev => prev.filter(item => item !== ingredient));
  };

  // Handle key press for adding ingredients
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addUserIngredient();
    }
  };

  // Get ML recommendations
  const getMLRecommendations = async () => {
    const allIngredients = [...selectedIngredients.map(ing => ing.toLowerCase()), ...userIngredients];
    
    if (allIngredients.length === 0) {
      setError('Pilih setidaknya satu bahan untuk mendapat rekomendasi');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const payload = {
          ingredients: allIngredients,
          ...(complexityFilter && { complexity_filter: complexityFilter }),
          ...(minRating && { min_rating: parseFloat(minRating) }),
          top_n: topN
        };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const response = await fetch(`${API_BASE_URL}/ml/recommend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Gagal mendapat rekomendasi');
        }
        
        setRecommendations(data.recommendations || []);
        setApiMessage(data.message || '');
        setAfterFilters(data.after_filters || 0);
        setHasSearched(true);
        break; // Success, exit retry loop
        
      } catch (err) {
        console.error(`Attempt ${attempt} failed:`, err);
        
        if (attempt === maxRetries) {
          if (err.name === 'AbortError') {
            setError('Request timeout - Hugging Face model mungkin sedang cold start, coba lagi dalam beberapa menit');
          } else {
            setError(err.message || 'Terjadi kesalahan saat mengambil rekomendasi');
          }
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    setLoading(false);
  };
  // Clear all filters
  const clearAllFilters = () => {
    setSelectedIngredients([]);
    setUserIngredients([]);
    setComplexityFilter('');
    setMinRating('');
    setTopN(10);
    setSearchTerm('');
    setRecommendations([]);
    setError('');
    setHasSearched(false);
    setApiMessage('');
    setAfterFilters(0);
  };

  // Filter recommendations based on search term
  const filteredRecommendations = recommendations.filter(recipe =>
    recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get complexity color
  const getComplexityColor = (complexity) => {
    switch (complexity?.toLowerCase()) {
      case 'cepat & mudah':
        return 'bg-green-100 text-green-700';
      case 'butuh usaha':
        return 'bg-yellow-100 text-yellow-700';
      case 'sulit':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  function toTitleCase(str) {
    if (!str) return 'Judul tidak tersedia';
    
    // Daftar kata yang biasanya tidak dikapitalisasi (kecuali di awal kalimat)
    const smallWords = ['dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'dalam', 'yang', 'adalah', 'akan', 'telah', 'sudah', 'masih', 'juga', 'hanya', 'tidak', 'bukan', 'agar', 'supaya', 'bila', 'jika', 'kalau', 'karena', 'sebab', 'oleh', 'tentang', 'antara', 'hingga', 'sampai', 'serta', 'bahwa', 'seperti', 'bagaikan', 'ibarat'];
    
    return str
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        // Kapitalisasi huruf pertama atau jika bukan kata kecil
        if (index === 0 || !smallWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  }

  // Get rating stars
  const getRatingStars = (rating) => {
    const stars = [];
    const numRating = typeof rating === 'number' ? rating : parseInt(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  // Parse ingredients string to array
  const parseIngredients = (ingredientsString) => {
    if (!ingredientsString) return [];
    return ingredientsString.split('--').filter(ing => ing.trim() !== '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-orange-600">🍳 We're Cooked</h1>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">ML Recipe Recommendations</span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filter */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari resep..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* User Input for Ingredients */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Tambah Bahan yang Kamu Punya</h3>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Ketik bahan (misal: tomat, nasi)"
                      value={ingredientInput}
                      onChange={(e) => setIngredientInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      onClick={addUserIngredient}
                      disabled={!ingredientInput.trim()}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      Tambah
                    </button>
                  </div>
                  
                  {/* Display user ingredients */}
                  {userIngredients.length > 0 && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-orange-800 mb-2">Bahan yang kamu punya:</h4>
                      <div className="flex flex-wrap gap-2">
                        {userIngredients.map((ingredient) => (
                          <span
                            key={ingredient}
                            className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm flex items-center space-x-2"
                          >
                            <span>{ingredient}</span>
                            <button
                              onClick={() => removeUserIngredient(ingredient)}
                              className="text-orange-600 hover:text-orange-800 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Main Ingredients from Backend */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Bahan Utama</h3>
                  {loadingCategories && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
                </div>
                
                {loadingCategories ? (
                  <div className="text-center py-4">
                    <div className="text-gray-500">Memuat kategori...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <label key={category.key} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border border-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedIngredients.includes(category.key)}
                          onChange={() => handleIngredientChange(category.key)}
                          className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <span className="text-xl">{category.icon}</span>
                        <div className="flex-1">
                          <span className="text-sm text-gray-700 font-medium">{category.name}</span>
                          <div className="text-xs text-gray-500">({category.count} resep)</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                
                {!loadingCategories && categories.length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-gray-500 mb-2">Gagal memuat kategori</div>
                    <button
                      onClick={fetchCategories}
                      className="text-orange-500 hover:text-orange-700 text-sm"
                    >
                      Coba lagi
                    </button>
                  </div>
                )}
              </div>

              {/* Additional Ingredients */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Bahan Tambahan</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {additionalIngredients.map((ingredient) => (
                    <label key={ingredient.name} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedIngredients.includes(ingredient.name)}
                        onChange={() => handleIngredientChange(ingredient.name)}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-lg">{ingredient.icon}</span>
                      <span className="text-sm text-gray-700">{ingredient.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ML Filters */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Filter ML</h3>
                <div className="space-y-4">
                  {/* Complexity Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat Kesulitan</label>
                    <select
                      value={complexityFilter}
                      onChange={(e) => setComplexityFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="">Semua Tingkat</option>
                      <option value="Cepat & Mudah">Cepat & Mudah</option>
                      <option value="Butuh Usaha">Butuh Usaha</option>
                      <option value="Level Dewa Masak">Level Dewa Masak</option>
                    </select>
                  </div>

                  {/* Min Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating Minimum</label>
                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="">Semua Rating</option>
                      <option value="1">1+ ⭐</option>
                      <option value="2">2+ ⭐</option>
                      <option value="3">3+ ⭐</option>
                      <option value="4">4+ ⭐</option>
                      <option value="5">5+ ⭐</option>
                    </select>
                  </div>

                  {/* Top N */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Rekomendasi</label>
                    <select
                      value={topN}
                      onChange={(e) => setTopN(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="6">6 resep</option>
                      <option value="9">9 resep</option>
                      <option value="12">12 resep</option>
                      <option value="15">15 resep</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={getMLRecommendations}
                  disabled={loading || (selectedIngredients.length === 0 && userIngredients.length === 0)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mencari Resep...</span>
                    </>
                  ) : (
                    <>
                      <ChefHat className="w-4 h-4" />
                      <span>Cari Rekomendasi ML</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 px-4 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header Info */}
            <div className="mb-6 text-center">
              <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                <div className="text-6xl mb-4">🍳</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {hasSearched 
                    ? 'Rekomendasi ML untuk Anda' 
                    : 'Punya bahan apa di kulkas?'}
                </h2>
                <p className="text-gray-600">
                  {hasSearched
                    ? apiMessage || `Ditemukan ${filteredRecommendations.length} resep dari Machine Learning`
                    : 'Pilih bahan yang kamu punya, lalu klik "Cari Rekomendasi ML" untuk mendapat saran resep yang dipersonalisasi.'}
                </p>
                {afterFilters > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    Total resep setelah filter: {afterFilters}
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-red-500">⚠️</div>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {(selectedIngredients.length > 0 || userIngredients.length > 0) && (
              <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-3">Bahan Dipilih:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedIngredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{ingredient}</span>
                      <button
                        onClick={() => handleIngredientChange(ingredient)}
                        className="text-orange-500 hover:text-orange-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {userIngredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{ingredient}</span>
                      <button
                        onClick={() => removeUserIngredient(ingredient)}
                        className="text-green-500 hover:text-green-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recipe Grid */}
            {filteredRecommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecommendations.map((recipe, index) => {
                  // Function untuk handle click pada setiap recipe card
                  const handleRecipeClick = () => {
                    const recipeId = recipe.item_id || recipe.id || recipe._id;
                    if (recipeId) {
                      navigate(`/resep/${recipeId}`);
                    } else {
                      console.error('Recipe ID not found:', recipe);
                    }
                  };

                  return (
                    <div 
                      key={recipe.id || index} 
                      className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-gray-100 cursor-pointer transform hover:scale-105 transition-all duration-200"
                      onClick={handleRecipeClick}
                    >
                      <div className="p-6">
                        <div className="text-4xl mb-4 text-center">
                          {categories.find(cat => cat.name.toLowerCase() === recipe.category?.toLowerCase())?.icon || '🍽️'}
                        </div>
                        
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{toTitleCase(recipe.title)}</h3>
                        
                        <div className="flex items-center justify-between mb-4">
                          {/* Rating */}
                          <div className="flex items-center space-x-1">
                            {getRatingStars(recipe.rating)}
                            <span className="text-sm text-gray-600 ml-1">({recipe.rating})</span>
                          </div>
                          
                          {/* Similarity Score */}
                          {recipe.similarity_score && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                              {Math.round(recipe.similarity_score * 100)}% match
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          {/* Category */}
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {recipe.category}
                          </span>
                          
                          {/* Complexity */}
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(recipe.complexity)}`}>
                            {recipe.complexity}
                          </span>
                        </div>
                        {/* Ingredients */}
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-gray-800 mb-2 text-sm">Bahan-bahan:</h4>
                          <div className="max-h-32 overflow-y-auto">
                            <div className="flex flex-wrap gap-1">
                              {parseIngredients(recipe.ingredients).slice(0, 8).map((ingredient, idx) => {
                                const cleanIngredient = ingredient.trim();
                                const isUserIngredient = userIngredients.some(userIng => 
                                  cleanIngredient.toLowerCase().includes(userIng.toLowerCase()) ||
                                  userIng.toLowerCase().includes(cleanIngredient.toLowerCase())
                                );
                                const isSelectedIngredient = selectedIngredients.some(selIng =>
                                  cleanIngredient.toLowerCase().includes(selIng.toLowerCase()) ||
                                  selIng.toLowerCase().includes(cleanIngredient.toLowerCase())
                                );
                                
                                return (
                                  <span
                                    key={idx}
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      isUserIngredient
                                        ? 'bg-green-100 text-green-700 font-medium ring-1 ring-green-200'
                                        : isSelectedIngredient
                                        ? 'bg-orange-100 text-orange-700 font-medium'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                    title={cleanIngredient}
                                  >
                                    {cleanIngredient.length > 15 ? cleanIngredient.substring(0, 15) + '...' : cleanIngredient}
                                    {isUserIngredient && <span className="ml-1 text-green-600">✓</span>}
                                  </span>
                                );
                              })}
                              {parseIngredients(recipe.ingredients).length > 8 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                  +{parseIngredients(recipe.ingredients).length - 8} lainnya
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* No Results */}
            {hasSearched && filteredRecommendations.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😅</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada rekomendasi yang ditemukan</h3>
                <p className="text-gray-500 mb-4">Coba ubah bahan atau filter yang dipilih</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Mencari Rekomendasi Terbaik...</h3>
                <p className="text-gray-500">Machine Learning sedang menganalisis bahan-bahan Anda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipe;