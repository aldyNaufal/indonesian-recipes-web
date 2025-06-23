const {
  checkHealth,
  getCategories,
  getRecipeRecommendations,
  getSimilarRecipes,
} = require('../services/mlService');

const {
  recommendSchema,
  similarSchema,
} = require('../validations/mlValidation');

async function healthCheckController(request, h) {
  try {
    const result = await checkHealth();
    return h.response(result).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
}

async function getCategoriesController(request, h) {
  try {
    const result = await getCategories();
    return h.response(result).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
}

async function getRecommendationsController(request, h) {
  const payload = request.payload;

  const { error } = recommendSchema.validate(payload);
  if (error) {
    return h.response({ message: error.details[0].message }).code(400);
  }

  const { ingredients, complexity_filter, min_rating, top_n } = payload;

  try {
    const filters = {};
    if (complexity_filter) filters.complexity_filter = complexity_filter;
    if (min_rating) filters.min_rating = min_rating;
    if (top_n) filters.top_n = top_n;

    const result = await getRecipeRecommendations(ingredients, filters);
    return h.response(result).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
}

async function getSimilarRecipesController(request, h) {
  const payload = request.payload;

  const { error } = similarSchema.validate(payload);
  if (error) {
    return h.response({ message: error.details[0].message }).code(400);
  }

  try {
    const recipeTitle = payload.recipe_title || '';
    const topN = payload.top_n || 10;

    const result = await getSimilarRecipes(recipeTitle, topN);
    return h.response(result).code(200);
  } catch (error) {
    return h.response({ message: error.message }).code(500);
  }
}

module.exports = {
  healthCheckController,
  getCategoriesController,
  getRecommendationsController,
  getSimilarRecipesController,
};
