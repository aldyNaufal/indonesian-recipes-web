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
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
        exposedHeaders: ['WWW-Authenticate', 'Server-Authorization'],
        additionalExposedHeaders: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
        maxAge: 60,
        credentials: true
      },
    },
  });

  // Add health check endpoint
  server.route({
    method: 'GET',
    path: '/health',
    handler: (request, h) => {
      return { status: 'healthy', timestamp: new Date().toISOString() };
    }
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
  console.log('Available routes:');
  server.table().forEach((route) => {
      console.log(`${route.method.toUpperCase()}\t${route.path}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();