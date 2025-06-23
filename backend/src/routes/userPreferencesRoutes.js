const userPreferencesHandler = require('../handlers/userPreferencesHandler');
const { authMiddleware } = require('../middlewares/authMiddleware');

const userPreferencesRoutes = [
  {
    method: 'POST',
    path: '/api/preferences',
    handler: userPreferencesHandler.savePreferencesHandler,
    options: { 
      pre: [authMiddleware],
      tags: ['api', 'preferences'],
      description: 'Save or update user preferences'
    },
  },
  {
    method: 'GET',
    path: '/api/preferences',
    handler: userPreferencesHandler.getPreferencesHandler,
    options: { 
      pre: [authMiddleware],
      tags: ['api', 'preferences'],
      description: 'Get user preferences'
    },
  },
  {
    method: 'DELETE',
    path: '/api/preferences',
    handler: userPreferencesHandler.deletePreferencesHandler,
    options: { 
      pre: [authMiddleware],
      tags: ['api', 'preferences'],
      description: 'Delete user preferences'
    },
  },
  {
    method: 'GET',
    path: '/api/preferences/{id}',
    handler: userPreferencesHandler.getPreferencesByIdHandler,
    options: { 
      pre: [authMiddleware],
      tags: ['api', 'preferences', 'admin'],
      description: 'Get preferences by ID (admin only)'
    },
  },
];

module.exports = userPreferencesRoutes;