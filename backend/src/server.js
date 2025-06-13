require('dotenv').config();
const Hapi = require('@hapi/hapi');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const userPreferencesRoutes = require('./routes/userPreferencesRoutes');
const mlRoutes = require('./routes/mlRoutes');
const homeRoutes = require('./routes/homeRoutes');

const { connectToMongo } = require('./services/db');

const init = async () => {
  await connectToMongo();

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.route([
    ...authRoutes,
    ...userRoutes,
    ...bookmarkRoutes,
    ...recipeRoutes,
    ...userPreferencesRoutes,
    ...mlRoutes,
    ...homeRoutes,
  ]);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();
