const userHandler = require('../handlers/userHandler');
const { authMiddleware } = require('../middlewares/authMiddleware');

const userRoutes = [
  {
    method: 'GET',
    path: '/api/profile',
    handler: userHandler.getProfile,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: 'PUT',
    path: '/api/profile',
    options: { pre: [authMiddleware] },
    handler: userHandler.updateProfile,
  },
  {
    method: 'PUT',
    path: '/api/profile/password',
    options: { pre: [authMiddleware] },
    handler: userHandler.updatePassword,
  },
];

module.exports = userRoutes;