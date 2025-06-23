const homeHandler = require('../handlers/homeHandler');

module.exports = [
  { method: 'GET', path: '/', handler: homeHandler.getHomeStats },
];
