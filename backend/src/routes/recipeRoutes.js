// routes/recipes.js (atau sesuai struktur project Anda)
const { 
  getAllRecipes, 
  getRecipeById, 
  getCategories,
  getRecipesByCategory,
  getTopMenuHemat,
  getTopAndalan,
  getBanyakDisukai
} = require('../handlers/recipeHandler'); // Sesuaikan path

const routes = [
  // Public routes (tidak perlu autentikasi)
  {
    method: 'GET',
    path: '/api/categories',
    handler: getCategories,
    options: {
      auth: false, // Atau sesuai konfigurasi auth Anda
      cors: {
        origin: ['*'], // Sesuaikan dengan domain frontend
        headers: ['Accept', 'Authorization', 'Content-Type']
      }
    }
  },
  



  // Guest recipe routes (tidak perlu autentikasi)
  {
    method: 'GET',
    path: '/api/guest/top-menu-hemat',
    handler: getTopMenuHemat,
    options: {
      auth: false,
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type']
      }
    }
  },
  
  {
    method: 'GET',
    path: '/api/guest/banyak-disukai',
    handler: getBanyakDisukai,
    options: {
      auth: false,
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type']
      }
    }
  },
  
  {
    method: 'GET',
    path: '/api/guest/top-andalan',
    handler: getTopAndalan,
    options: {
      auth: false,
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type']
      }
    }
  },
  
  // Recipe routes
  {
    method: 'GET',
    path: '/api/recipes',
    handler: getAllRecipes,
    options: {
      auth: false, // Atau sesuai kebutuhan
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type']
      }
    }
  },
  
  {
    method: 'GET',
    path: '/api/recipes/{id}',
    handler: getRecipeById,
    options: {
      auth: false, // Atau sesuai kebutuhan
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type']
      }
    }
  },
  
  {
    method: 'GET',
    path: '/api/recipes/category/{category}',
    handler: getRecipesByCategory,
    options: {
      auth: false,
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type']
      }
    }
  }
];

module.exports = routes;
