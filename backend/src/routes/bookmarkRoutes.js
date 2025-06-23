const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  getBookmarks,
  addBookmark,
  deleteBookmark,
} = require('../handlers/bookmarkHandler');

const bookmarkRoutes = [
  {
    method: 'GET',
    path: '/api/bookmark',
    handler: getBookmarks,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: 'POST',
    path: '/api/bookmark',
    handler: addBookmark,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: 'DELETE',
    path: '/api/bookmark/{id}',
    handler: deleteBookmark,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
];

module.exports = bookmarkRoutes;