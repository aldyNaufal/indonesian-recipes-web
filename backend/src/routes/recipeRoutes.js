const { getAllRecipes, getRecipeById } = require('../handlers/recipeHandler');
const { authRecipeMiddleware } = require('../middlewares/authMiddleware');

const routes = [
  {
    method: 'GET',
    path: '/resep',
    handler: getAllRecipes,
    options: { pre: [authRecipeMiddleware] },
  },
  {
    method: 'GET',
    path: '/resep/{id}',
    handler: getRecipeById,
    options: { pre: [authRecipeMiddleware] },
  },
];

module.exports = routes;
