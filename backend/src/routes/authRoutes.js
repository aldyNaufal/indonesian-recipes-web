const authHandler = require('../handlers/authHandler');

module.exports = [
  { method: 'POST', path: '/api/register', handler: authHandler.register },
  { method: 'POST', path: '/api/login', handler: authHandler.login },
];