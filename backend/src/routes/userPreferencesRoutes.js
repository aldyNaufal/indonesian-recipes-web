const userPreferencesHandler = require('../handlers/userPreferencesHandler');
const { authMiddleware } = require('../middlewares/authMiddleware');

const userPreferencesRoutes = [
  {
    method: 'POST',
    path: '/api/preferences',
    handler: userPreferencesHandler.savePreferencesHandler,
    options: { pre: [authMiddleware] },
  },
  {
    method: 'GET',
    path: '/api/preferences',
    handler: userPreferencesHandler.getPreferencesHandler,
    options: { pre: [authMiddleware] },
  },
];

module.exports = userPreferencesRoutes;