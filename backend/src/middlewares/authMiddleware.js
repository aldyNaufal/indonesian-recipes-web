const jwt = require('jsonwebtoken');
const Boom = require('@hapi/boom');

const authMiddleware = (request, h) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw Boom.unauthorized('Token tidak ditemukan');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.auth = {
      isAuthenticated: true,
      credentials: decoded,
    };
    return h.continue;
  } catch (err) {
    throw Boom.unauthorized('Token tidak valid');
  }
};

const authRecipeMiddleware = (request, h) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return h.continue;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.auth = {
      isAuthenticated: true,
      credentials: decoded,
    };
    return h.continue;
  } catch (err) {
    return h.continue;
  }
};

module.exports = { authMiddleware, authRecipeMiddleware };
