const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

function generateToken(user) {
  const payload = { id: user.id, name: user.name, email: user.email };
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = { generateToken, verifyToken };
