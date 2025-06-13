const authHandler = require('../handlers/authHandler');

module.exports = [
  { method: 'POST', path: '/register', handler: authHandler.register },
  { method: 'POST', path: '/login', handler: authHandler.login },
];
