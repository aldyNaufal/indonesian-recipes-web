const userHandler = require('../handlers/userHandler');
const { authMiddleware } = require('../middlewares/authMiddleware');

const userRoutes = [
  {
    method: 'GET',
    path: '/profile',
    handler: userHandler.getProfile,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: 'PUT',
    path: '/profile',
    options: { pre: [authMiddleware] },
    handler: userHandler.updateProfile,
  },
  {
    method: 'PUT',
    path: '/profile/password',
    options: { pre: [authMiddleware] },
    handler: userHandler.updatePassword,
  },
];

module.exports = userRoutes;
