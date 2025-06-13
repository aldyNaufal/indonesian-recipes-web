const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  getBookmarks,
  addBookmark,
  deleteBookmark,
} = require('../handlers/bookmarkHandler');

const bookmarkRoutes = [
  {
    method: 'GET',
    path: '/bookmark',
    handler: getBookmarks,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: 'POST',
    path: '/bookmark',
    handler: addBookmark,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: 'DELETE',
    path: '/bookmark/{id}',
    handler: deleteBookmark,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
];

module.exports = bookmarkRoutes;
