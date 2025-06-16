import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, Users } from 'lucide-react';

const RecipeFilterApp = () => {
  // Data resep dengan ingredients dan kategori
  const recipes = [
    {
      id: 1,
      name: "Nasi Goreng Kampung",
      image: "🍛",
      ingredients: ["Nasi", "Telur", "Cabai", "Bawang Merah", "Kecap Manis"],
      category: "Nasi",
      cookTime: "15 menit",
      servings: 2,
      description: "Nasi goreng khas Indonesia dengan bumbu tradisional"
    },
    {
      id: 2,
      name: "Ayam Bakar Madu",
      image: "🍗",
      ingredients: ["Ayam", "Madu", "Kecap Manis", "Bawang Putih", "Jahe"],
      category: "Ayam",
      cookTime: "45 menit",
      servings: 4,
      description: "Ayam bakar dengan glazing madu yang manis"
    },
    {
      id: 3,
      name: "Soto Ayam",
      image: "🍲",
      ingredients: ["Ayam", "Kunyit", "Bawang Merah", "Bawang Putih", "Serai"],
      category: "Sup",
      cookTime: "60 menit",
      servings: 4,
      description: "Sup ayam tradisional Indonesia yang hangat"
    },
    {
      id: 4,
      name: "Gado-Gado",
      image: "🥗",
      ingredients: ["Tahu", "Tempe", "Kacang Tanah", "Sayuran", "Lontong"],
      category: "Salad",
      cookTime: "20 menit",
      servings: 2,
      description: "Salad Indonesia dengan saus kacang"
    },
    {
      id: 5,
      name: "Rendang Daging",
      image: "🥩",
      ingredients: ["Daging Sapi", "Santan", "Cabai", "Serai", "Daun Jeruk"],
      category: "Daging",
      cookTime: "180 menit",
      servings: 6,
      description: "Rendang daging sapi khas Padang"
    },
    {
      id: 6,
      name: "Mie Ayam",
      image: "🍜",
      ingredients: ["Mie", "Ayam", "Bakso", "Sawi", "Bawang Goreng"],
      category: "Mie",
      cookTime: "30 menit",
      servings: 1,
      description: "Mie ayam dengan topping lengkap"
    },
    {
      id: 7,
      name: "Ikan Bakar",
      image: "🐟",
      ingredients: ["Ikan", "Cabai", "Tomat", "Bawang Merah", "Jeruk Nipis"],
      category: "Ikan",
      cookTime: "25 menit",
      servings: 2,
      description: "Ikan bakar dengan sambal segar"
    },
    {
      id: 8,
      name: "Sayur Asem",
      image: "🥬",
      ingredients: ["Sayuran", "Asam Jawa", "Cabai", "Gula Merah", "Garam"],
      category: "Sayur",
      cookTime: "30 menit",
      servings: 4,
      description: "Sayur kuah asam segar"
    }
  ];

  // Daftar bahan utama (kategori protein) dengan icon
  const mainIngredients = [
    { name: "Ayam", icon: "🐔" },
    { name: "Ikan", icon: "🐟" },
    { name: "Kambing", icon: "🐐" },
    { name: "Sapi", icon: "🐄" },
    { name: "Tahu", icon: "🧈" },
    { name: "Telur", icon: "🥚" },
    { name: "Tempe", icon: "🟫" },
    { name: "Udang", icon: "🦐" }
  ];

  // Daftar bahan tambahan dengan icon
  const additionalIngredients = [
    { name: "Nasi", icon: "🍚" },
    { name: "Mie", icon: "🍜" },
    { name: "Santan", icon: "🥥" },
    { name: "Cabai", icon: "🌶️" },
    { name: "Bawang Merah", icon: "🧅" },
    { name: "Bawang Putih", icon: "🧄" },
    { name: "Tomat", icon: "🍅" },
    { name: "Sayuran", icon: "🥬" },
    { name: "Kecap Manis", icon: "🍯" },
    { name: "Garam", icon: "🧂" },
    { name: "Madu", icon: "🍯" },
    { name: "Kunyit", icon: "🟡" },
    { name: "Jahe", icon: "🫚" },
    { name: "Serai", icon: "🌿" },
    { name: "Daun Jeruk", icon: "🍃" },
    { name: "Kacang Tanah", icon: "🥜" },
    { name: "Lontong", icon: "🍘" },
    { name: "Bakso", icon: "⚪" },
    { name: "Sawi", icon: "🥬" },
    { name: "Bawang Goreng", icon: "🧅" },
    { name: "Jeruk Nipis", icon: "🍋" },
    { name: "Asam Jawa", icon: "🟤" },
    { name: "Gula Merah", icon: "🟫" }
  ];

  const allCategories = [...new Set(recipes.map(recipe => recipe.category))].sort();

  // State untuk filter
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');

  // Shuffle array untuk menampilkan resep secara random
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize dengan resep random
  useEffect(() => {
    setFilteredRecipes(shuffleArray(recipes));
  }, []);

  // Filter recipes berdasarkan ingredients, categories, dan search term
  useEffect(() => {
    let filtered = recipes;

    // Gabungkan selected ingredients dengan user ingredients
    const allSelectedIngredients = [...selectedIngredients];

    // Filter berdasarkan ingredients
    if (allSelectedIngredients.length > 0) {
      filtered = filtered.filter(recipe =>
        allSelectedIngredients.some(ingredient =>
          recipe.ingredients.some(recipeIngredient =>
            recipeIngredient.toLowerCase().includes(ingredient.toLowerCase()) ||
            ingredient.toLowerCase().includes(recipeIngredient.toLowerCase())
          )
        )
      );
    }

    // Filter berdasarkan categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(recipe =>
        selectedCategories.includes(recipe.category)
      );
    }

    // Filter berdasarkan search term
    if (searchTerm) {
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Jika tidak ada filter yang aktif, tampilkan random
    if (allSelectedIngredients.length === 0 && selectedCategories.length === 0 && !searchTerm) {
      filtered = shuffleArray(recipes);
    }

    setFilteredRecipes(filtered);
  }, [selectedIngredients, selectedCategories, searchTerm, userIngredients]);

  // Handle main ingredient checkbox change
  const handleMainIngredientChange = (ingredient) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  // Handle additional ingredient checkbox change
  const handleAdditionalIngredientChange = (ingredient) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  // Handle category checkbox change
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(item => item !== category)
        : [...prev, category]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedIngredients([]);
    setSelectedCategories([]);
    setSearchTerm('');
    setUserIngredients([]);
    setIngredientInput('');
    setFilteredRecipes(shuffleArray(recipes));
  };

  // Add user ingredient
  const addUserIngredient = () => {
    if (ingredientInput.trim() && !userIngredients.includes(ingredientInput.trim())) {
      const newIngredient = ingredientInput.trim();
      setUserIngredients(prev => [...prev, newIngredient]);
      setSelectedIngredients(prev => [...prev, newIngredient]);
      setIngredientInput('');
    }
  };

  // Remove user ingredient
  const removeUserIngredient = (ingredient) => {
    setUserIngredients(prev => prev.filter(item => item !== ingredient));
    setSelectedIngredients(prev => prev.filter(item => item !== ingredient));
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addUserIngredient();
    }
  };

  // Randomize recipes
  const randomizeRecipes = () => {
    setFilteredRecipes(shuffleArray(filteredRecipes));
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
              <span className="text-gray-600">Bahan</span>
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
                    placeholder="Cari resep atau bahan..."
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
                      placeholder="Ketik bahan (misal: tomat, ayam, nasi)"
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

              {/* Bahan Utama */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Bahan Utama</h3>
                <div className="grid grid-cols-2 gap-2">
                  {mainIngredients.map((ingredient) => (
                    <label key={ingredient.name} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border border-gray-100">
                      <input
                        type="checkbox"
                        checked={selectedIngredients.includes(ingredient.name)}
                        onChange={() => handleMainIngredientChange(ingredient.name)}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-xl">{ingredient.icon}</span>
                      <span className="text-sm text-gray-700 font-medium">{ingredient.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Bahan Tambahan */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Bahan Tambahan</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {additionalIngredients.map((ingredient) => (
                    <label key={ingredient.name} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedIngredients.includes(ingredient.name)}
                        onChange={() => handleAdditionalIngredientChange(ingredient.name)}
                        className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-lg">{ingredient.icon}</span>
                      <span className="text-sm text-gray-700">{ingredient.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
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
                  {(selectedIngredients.length > 0 || selectedCategories.length > 0 || searchTerm) 
                    ? 'Resep yang Cocok untuk Anda' 
                    : 'Punya bahan apa di kulkas?'}
                </h2>
                <p className="text-gray-600">
                  {(selectedIngredients.length > 0 || selectedCategories.length > 0 || searchTerm)
                    ? `Ditemukan ${filteredRecipes.length} resep sesuai filter Anda`
                    : 'Kami akan beri rekomendasi resep sesuai dengan bahan yang kamu punya.'}
                </p>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedIngredients.length > 0 || selectedCategories.length > 0) && (
              <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-3">Filter Aktif:</h4>
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
                  {selectedCategories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{category}</span>
                      <button
                        onClick={() => handleCategoryChange(category)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-6">
                    <div className="text-4xl mb-4 text-center">{recipe.image}</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{recipe.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{recipe.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.cookTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings} porsi</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {recipe.category}
                      </span>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-800 mb-2 text-sm">Bahan-bahan:</h4>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.map((ingredient) => {
                          const isUserIngredient = userIngredients.some(userIng => 
                            ingredient.toLowerCase().includes(userIng.toLowerCase()) ||
                            userIng.toLowerCase().includes(ingredient.toLowerCase())
                          );
                          const isSelectedIngredient = selectedIngredients.includes(ingredient);
                          
                          // Cari icon untuk ingredient
                          const mainIngredient = mainIngredients.find(item => item.name === ingredient);
                          const additionalIngredient = additionalIngredients.find(item => item.name === ingredient);
                          const ingredientIcon = mainIngredient?.icon || additionalIngredient?.icon;
                          
                          return (
                            <span
                              key={ingredient}
                              className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${
                                isUserIngredient
                                  ? 'bg-green-100 text-green-700 font-medium ring-2 ring-green-200'
                                  : isSelectedIngredient
                                  ? 'bg-orange-100 text-orange-700 font-medium'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {ingredientIcon && <span className="text-xs">{ingredientIcon}</span>}
                              <span>{ingredient}</span>
                              {isUserIngredient && <span className="text-green-600">✓</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredRecipes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😅</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada resep yang ditemukan</h3>
                <p className="text-gray-500 mb-4">Coba ubah filter atau kata kunci pencarian Anda</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeFilterApp;