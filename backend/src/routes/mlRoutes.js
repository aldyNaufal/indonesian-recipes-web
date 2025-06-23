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
    options: {
      auth: false,
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type'],
      },
    },
  },
  {
    method: 'GET',
    path: '/ml/categories',
    handler: getCategoriesController,
    options: {
      auth: false,
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type'],
      },
    },
  },
  {
    method: 'POST',
    path: '/ml/recommend',
    handler: getRecommendationsController,
    options: {
      auth: false,
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type'],
      },
    },
  },
  {
    method: 'POST',
    path: '/ml/similar',
    handler: getSimilarRecipesController,
    options: {
      auth: false,
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type'],
      },
    },
  },
];

module.exports = mlRoutes;
