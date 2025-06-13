const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  healthCheckController,
  getCategoriesController,
  getRecommendationsController,
  getSimilarRecipesController,
} = require('../handlers/mlHandler');

const mlRoutes = [
  {
    method: 'GET',
    path: '/ml/health',
    handler: healthCheckController,
  },
  {
    method: 'GET',
    path: '/ml/categories',
    handler: getCategoriesController,
  },
  {
    method: 'POST',
    path: '/ml/recommend',
    handler: getRecommendationsController,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: 'POST',
    path: '/ml/similar',
    handler: getSimilarRecipesController,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
];

module.exports = mlRoutes;
