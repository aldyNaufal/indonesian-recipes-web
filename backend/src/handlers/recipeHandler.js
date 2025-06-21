const { getDb } = require('../services/db');

const getAllRecipes = async (request, h) => {
  const { search, page = 1, limit = 50, category } = request.query;
  const db = getDb();
  const query = {};

  // ✅ HAPUS authentication check jika endpoint ini memang public
  // Langsung proses query tanpa cek auth
  
  // Filter berdasarkan kategori
  if (category) {
    query['Ingredients Cleaned'] = { $regex: category, $options: 'i' };
  }

  if (search) {
    const input = search
      .toLowerCase()
      .split(',')
      .map((i) => i.trim());
    query.$and = input.map((bahan) => ({
      $or: [
        { 'Ingredients Cleaned': { $regex: bahan, $options: 'i' } },
        { Title: { $regex: bahan, $options: 'i' } },
      ],
    }));
  }

  const pageInt = Math.max(parseInt(page), 1);
  let limitInt = Math.min(parseInt(limit), 50);
  if (limitInt <= 0 || isNaN(limitInt)) limitInt = 50;
  const skip = (pageInt - 1) * limitInt;

  const recipes = await db
    .collection('resep')
    .find(query)
    .skip(skip)
    .limit(limitInt)
    .project({ _id: 0 })
    .toArray();

  const total = await db.collection('resep').countDocuments(query);

  return h.response({
    error: false,
    data: recipes,
    pagination: {
      page: pageInt,
      limit: limitInt,
      total,
      totalPages: Math.ceil(total / limitInt),  
    },
  }).code(200);
};

// Backend handler dengan debug logging
const getRecipeById = async (request, h) => {
  const { id } = request.params;
  const db = getDb();
  
  try {
    console.log('🔍 DEBUG: Searching for recipe with ID:', id);
    console.log('🔍 DEBUG: ID type:', typeof id);
    
    // Debug: Cek beberapa dokumen di collection untuk melihat struktur data
    const sampleDocs = await db.collection('resep').find({}).limit(3).toArray();
    console.log('🔍 DEBUG: Sample documents in collection:');
    sampleDocs.forEach((doc, index) => {
      console.log(`Sample ${index + 1}:`, {
        _id: doc._id,
        id: doc.id,
        item_id: doc.item_id,
        title: doc.Title || doc['Title Cleaned']
      });
    });
    
    // Coba cari dengan berbagai kemungkinan
    console.log('🔍 DEBUG: Trying to find with item_id...');
    let recipe = await db.collection('resep').findOne({ item_id: id });
    console.log('🔍 DEBUG: Result with item_id:', recipe ? 'FOUND' : 'NOT FOUND');
    
    if (!recipe) {
      console.log('🔍 DEBUG: Trying to find with id field...');
      recipe = await db.collection('resep').findOne({ id: id });
      console.log('🔍 DEBUG: Result with id:', recipe ? 'FOUND' : 'NOT FOUND');
    }
    
    if (!recipe) {
      console.log('🔍 DEBUG: Trying to find with string conversion...');
      recipe = await db.collection('resep').findOne({ item_id: String(id) });
      console.log('🔍 DEBUG: Result with string item_id:', recipe ? 'FOUND' : 'NOT FOUND');
    }
    
    if (!recipe) {
      console.log('🔍 DEBUG: Trying to find with number conversion...');
      const numId = parseInt(id);
      if (!isNaN(numId)) {
        recipe = await db.collection('resep').findOne({ item_id: numId });
        console.log('🔍 DEBUG: Result with number item_id:', recipe ? 'FOUND' : 'NOT FOUND');
      }
    }
    
    // Debug: Coba cari yang mirip (partial match)
    if (!recipe) {
      console.log('🔍 DEBUG: Searching for similar IDs...');
      const similarRecipes = await db.collection('resep').find({
        $or: [
          { item_id: new RegExp(id, 'i') },
          { id: new RegExp(id, 'i') }
        ]
      }).limit(5).toArray();
      
      console.log('🔍 DEBUG: Similar recipes found:', similarRecipes.length);
      similarRecipes.forEach((doc, index) => {
        console.log(`Similar ${index + 1}:`, {
          _id: doc._id,
          id: doc.id,
          item_id: doc.item_id,
          title: doc.Title || doc['Title Cleaned']
        });
      });
    }
    
    if (!recipe) {
      console.log('❌ DEBUG: Recipe not found with any method');
      return h.response({
        error: true,
        message: 'Resep tidak ditemukan',
        debug: {
          searchedId: id,
          idType: typeof id,
          collectionCount: await db.collection('resep').countDocuments()
        }
      }).code(404);
    }
    
    console.log('✅ DEBUG: Recipe found:', {
      _id: recipe._id,
      id: recipe.id,
      item_id: recipe.item_id,
      title: recipe.Title || recipe['Title Cleaned']
    });
    
    // Remove _id from response
    const { _id, ...recipeWithoutId } = recipe;
    
    return h.response({
      error: false,
      message: 'Resep berhasil ditemukan',
      data: recipeWithoutId
    }).code(200);
    
  } catch (error) {
    console.error('❌ DEBUG: Error in getRecipeById:', error);
    return h.response({
      error: true,
      message: 'Terjadi kesalahan saat mengambil data resep',
      debug: error.message
    }).code(500);
  }
};

// Handler untuk mendapatkan categories (PUBLIC - TIDAK PERLU LOGIN)
const getCategories = async (request, h) => {
  try {
    const db = getDb();
    
    // Ambil data dari collection categoriesrecipes
    const categoriesData = await db
      .collection('categoriesrecipes')
      .findOne({}, { 
        projection: { 
          _id: 0, 
          ayam: 1, 
          ikan: 1, 
          kambing: 1, 
          sapi: 1, 
          tahu: 1, 
          telur: 1, 
          tempe: 1, 
          udang: 1 
        } 
      });

    if (!categoriesData) {
      return h.response({
        error: true,
        message: 'Data kategori tidak ditemukan'
      }).code(404);
    }

    // Mapping kategori dengan icon dan description
    const categoryMap = {
      "ayam": { 
        name: "Ayam",
        icon: "🐔", 
        description: "Berbagai resep masakan ayam yang lezat dan bergizi",
        count: categoriesData.ayam?.length || 0
      },
      "ikan": { 
        name: "Ikan",
        icon: "🐟", 
        description: "Resep ikan segar dengan berbagai cara pengolahan",
        count: categoriesData.ikan?.length || 0
      },
      "kambing": { 
        name: "Kambing",
        icon: "🐐", 
        description: "Masakan kambing dengan cita rasa yang khas",
        count: categoriesData.kambing?.length || 0
      },
      "sapi": { 
        name: "Sapi",
        icon: "🐄", 
        description: "Daging sapi pilihan dengan bumbu rempah nusantara",
        count: categoriesData.sapi?.length || 0
      },
      "tahu": { 
        name: "Tahu",
        icon: "🟨", 
        description: "Olahan tahu yang kreatif dan menggugah selera",
        count: categoriesData.tahu?.length || 0
      },
      "telur": { 
        name: "Telur",
        icon: "🥚", 
        description: "Kreasi masakan telur yang praktis dan lezat",
        count: categoriesData.telur?.length || 0
      },
      "tempe": { 
        name: "Tempe",
        icon: "🟤", 
        description: "Tempe sebagai sumber protein nabati yang sehat",
        count: categoriesData.tempe?.length || 0
      },
      "udang": { 
        name: "Udang",
        icon: "🦐", 
        description: "Seafood udang dengan kelezatan yang tak terlupakan",
        count: categoriesData.udang?.length || 0
      }
    };

    // Buat array categories dari data yang ada
    const categoriesWithDetails = Object.keys(categoryMap)
      .filter(key => categoriesData[key]) // Hanya ambil kategori yang ada datanya
      .map(key => categoryMap[key]);

    return h.response({
      error: false,
      data: categoriesWithDetails
    }).code(200);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return h.response({
      error: true,
      message: 'Gagal mengambil data kategori'
    }).code(500);
  }
};

// Handler untuk mendapatkan recipes berdasarkan kategori (PUBLIC)
const getRecipesByCategory = async (request, h) => {
  const { category } = request.params;
  const { page = 1, limit = 12 } = request.query;
  
  try {
    const db = getDb();
    
    // Validasi kategori (sekarang menggunakan lowercase)
    const validCategories = [
      "ayam", "ikan", "kambing", "sapi", "tahu", "telur", "tempe", "udang"
    ];
    
    // Convert category ke lowercase untuk matching
    const categoryLower = category.toLowerCase();
    
    if (!validCategories.includes(categoryLower)) {
      return h.response({
        error: true,
        message: 'Kategori tidak valid'
      }).code(400);
    }

    // Query berdasarkan kategori dari database categoriesrecipes
    const categoryData = await db
      .collection('categoriesrecipes')
      .findOne({}, { projection: { _id: 0, [categoryLower]: 1 } });

    if (!categoryData || !categoryData[categoryLower]) {
      return h.response({
        error: true,
        message: `Data kategori ${category} tidak ditemukan`
      }).code(404);
    }

    const recipes = categoryData[categoryLower];
    
    // Implementasi pagination manual
    const pageInt = Math.max(parseInt(page), 1);
    let limitInt = Math.min(parseInt(limit), 50);
    if (limitInt <= 0 || isNaN(limitInt)) limitInt = 12;
    
    const startIndex = (pageInt - 1) * limitInt;
    const endIndex = startIndex + limitInt;
    const paginatedRecipes = recipes.slice(startIndex, endIndex);

    return h.response({
      error: false,
      data: paginatedRecipes,
      category: category,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total: recipes.length,
        totalPages: Math.ceil(recipes.length / limitInt),
      },
    }).code(200);
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    return h.response({
      error: true,
      message: 'Gagal mengambil resep berdasarkan kategori'
    }).code(500);
  }
};

// GUEST RECIPE HANDLERS - NEW ENDPOINTS FOR NON-AUTHENTICATED USERS

// Handler untuk Top Menu Hemat (combining Top_10_Resep_Pokoknya_Jadi + Top_5_Menu_Hemat_Tahu_Tempe)
const getTopMenuHemat = async (request, h) => {
  try {
    const db = getDb();
    
    const defaultRecipesData = await db
      .collection('defaultrecipes')
      .findOne({}, { 
        projection: { 
          _id: 0, 
          Top_10_Resep_Pokoknya_Jadi: 1, 
          Top_5_Menu_Hemat_Tahu_Tempe: 1 
        } 
      });

    if (!defaultRecipesData) {
      return h.response({
        error: true,
        message: 'Data resep tidak ditemukan'
      }).code(404);
    }

    // Combine the two arrays
    const combinedRecipes = [
      ...(defaultRecipesData.Top_10_Resep_Pokoknya_Jadi || []),
      ...(defaultRecipesData.Top_5_Menu_Hemat_Tahu_Tempe || [])
    ];

    return h.response({
      error: false,
      data: combinedRecipes
    }).code(200);
  } catch (error) {
    console.error('Error fetching top menu hemat:', error);
    return h.response({
      error: true,
      message: 'Gagal mengambil data top menu hemat'
    }).code(500);
  }
};

// Handler untuk Top Andalan (combining Top_10_Olahan_Telur_Andalan_Anak_Kos + Top_5_Kreasi_Mie_Instan_Praktis)
const getTopAndalan = async (request, h) => {
  try {
    const db = getDb();
    
    const defaultRecipesData = await db
      .collection('defaultrecipes')
      .findOne({}, { 
        projection: { 
          _id: 0, 
          Top_10_Olahan_Telur_Andalan_Anak_Kos: 1, 
          Top_5_Kreasi_Mie_Instan_Praktis: 1 
        } 
      });

    if (!defaultRecipesData) {
      return h.response({
        error: true,
        message: 'Data resep tidak ditemukan'
      }).code(404);
    }

    // Combine the two arrays
    const combinedRecipes = [
      ...(defaultRecipesData.Top_10_Olahan_Telur_Andalan_Anak_Kos || []),
      ...(defaultRecipesData.Top_5_Kreasi_Mie_Instan_Praktis || [])
    ];

    return h.response({
      error: false,
      data: combinedRecipes
    }).code(200);
  } catch (error) {
    console.error('Error fetching top andalan:', error);
    return h.response({
      error: true,
      message: 'Gagal mengambil data top andalan'
    }).code(500);
  }
};

// Handler untuk Banyak Disukai (keeping existing logic - you can modify as needed)
const getBanyakDisukai = async (request, h) => {
  try {
    const db = getDb();

    // Ambil 15 resep paling disukai berdasarkan rating
    const popularRecipes = await db
      .collection('toprecipes')
      .find({})
      .sort({ rating: -1 }) // atau ganti dengan 'total_rating' jika itu metrik utamanya
      .limit(15)
      .project({ _id: 0 })
      .toArray();

    if (!popularRecipes || popularRecipes.length === 0) {
      return h.response({
        error: true,
        message: 'Data resep tidak ditemukan'
      }).code(404);
    }

    return h.response({
      error: false,
      data: popularRecipes
    }).code(200);
  } catch (error) {
    console.error('Error fetching banyak disukai:', error);
    return h.response({
      error: true,
      message: 'Gagal mengambil data banyak disukai'
    }).code(500);
  }
};

module.exports = { 
  getAllRecipes, 
  getRecipeById, 
  getCategories,
  getRecipesByCategory,
  // New guest recipe handlers
  getTopMenuHemat,
  getTopAndalan,
  getBanyakDisukai
};