const axios = require('axios');

const ML_API_BASE_URL = process.env.ML_API_BASE_URL;

async function checkHealth() {
  try {
    const response = await axios.get(`${ML_API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check error:', error.message);
    throw new Error('Gagal melakukan health check ke ML API');
  }
}

async function getCategories() {
  try {
    const response = await axios.get(`${ML_API_BASE_URL}/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    throw new Error('Gagal mengambil kategori dan kompleksitas');
  }
}

async function getRecipeRecommendations(ingredients, filters = {}) {
  try {
    const payload = {
      ingredients,
      ...filters,
    };
    const response = await axios.post(`${ML_API_BASE_URL}/recommend`, payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommendations:', error.message);
    throw new Error('Gagal mengambil rekomendasi resep');
  }
}

async function getSimilarRecipes(recipeTitle, topN) {
  try {
    const payload = {
      recipe_title: recipeTitle,
      top_n: topN,
    };

    const response = await axios.post(`${ML_API_BASE_URL}/similar`, payload);
    return response.data;
  } catch (error) {
    console.error('Error fetching similar recipes:', error.message);
    throw new Error('Gagal mengambil resep yang mirip');
  }
}

module.exports = {
  checkHealth,
  getCategories,
  getRecipeRecommendations,
  getSimilarRecipes,
};
