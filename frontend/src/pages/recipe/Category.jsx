// CategoryPage.jsx - Menggunakan RecipeCard yang sudah ada
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { loadRecipesByCategory } from '../../utils/recipeService';
import RecipeCard from '../../components/recipe/RecipeCard';

const CategoryPage = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currentPage = parseInt(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchCategoryRecipes();
  }, [category, currentPage]);

  const fetchCategoryRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await loadRecipesByCategory(category, currentPage);
      
      // Transform data agar sesuai dengan format yang diharapkan RecipeCard
      const transformedRecipes = result.recipes.map(recipe => ({
        ...recipe,
        // Pastikan field yang dibutuhkan RecipeCard tersedia
        item_id: recipe.item_id || recipe._id || recipe.id,
        'Title Cleaned': recipe['Title Cleaned'] || recipe.title || recipe.name,
        'Image URL': recipe['Image URL'] || recipe.image || recipe.imageUrl,
        Category: recipe.Category || recipe.category || getCategoryDisplayName(category),
        total_rating: recipe.total_rating || recipe.rating || recipe.Rating || 4.5,
        Complexity: recipe.Complexity || recipe.difficulty || 'Medium'
      }));
      
      setRecipes(transformedRecipes);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message || 'Gagal memuat resep kategori');
      console.error('Error loading category recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryDisplayName = (categorySlug) => {
    const categoryMap = {
      'ayam': 'Ayam',
      'ikan': 'Ikan', 
      'kambing': 'Kambing',
      'sapi': 'Sapi',
      'tahu': 'Tahu',
      'telur': 'Telur',
      'tempe': 'Tempe',
      'udang': 'Udang'
    };
    return categoryMap[categorySlug] || categorySlug;
  };

  const getCategoryIcon = (categorySlug) => {
    const iconMap = {
      'ayam': '🐔',
      'ikan': '🐟',
      'kambing': '🐐', 
      'sapi': '🐄',
      'tahu': '🟨',
      'telur': '🥚',
      'tempe': '🟤',
      'udang': '🦐'
    };
    return iconMap[categorySlug] || '🍽️';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Memuat resep {getCategoryDisplayName(category)}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchCategoryRecipes}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">{getCategoryIcon(category)}</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Resep {getCategoryDisplayName(category)}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {pagination.total || 0} resep ditemukan
              </p>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <a href="/" className="hover:text-red-600 transition-colors">Beranda</a>
            <span className="mx-2">›</span>
            <span className="text-gray-800">Kategori {getCategoryDisplayName(category)}</span>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="container mx-auto px-6 py-8">
        {recipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">
              Belum Ada Resep
            </h3>
            <p className="text-gray-600 text-lg">
              Resep untuk kategori {getCategoryDisplayName(category)} belum tersedia.
            </p>
            <button 
              onClick={() => window.history.back()}
              className="mt-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Kembali
            </button>
          </div>
        ) : (
          <>
            {/* Recipe Stats */}
            <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> - 
                  <span className="font-semibold">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari 
                  <span className="font-semibold"> {pagination.total}</span> resep
                </div>
                <div className="text-sm text-gray-600">
                  Halaman <span className="font-semibold">{pagination.page}</span> dari 
                  <span className="font-semibold"> {pagination.totalPages}</span>
                </div>
              </div>
            </div>

            {/* Recipes Grid - Menggunakan RecipeCard yang sudah ada */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard 
                  key={recipe.item_id || recipe._id || index} 
                  recipe={recipe} 
                  index={index}
                  cardType="auto" // Auto-detect berdasarkan ketersediaan gambar
                  isGridLayout={true} // Untuk layout grid
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination 
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              category={category}
            />
          </>
        )}
      </div>
    </div>
  );
};

// Komponen Pagination yang disesuaikan
const Pagination = ({ currentPage, totalPages, onPageChange, category }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="mt-12 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-center items-center space-x-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        
        {/* Page Numbers */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-4 py-2 text-sm font-medium border rounded-md transition-colors ${
              page === currentPage
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                : page === '...'
                ? 'border-gray-300 cursor-default text-gray-400'
                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Page Info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Halaman {currentPage} dari {totalPages}
      </div>
    </div>
  );
};

export default CategoryPage;