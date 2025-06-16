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
        origin: ['*'], // Atau bisa spesifik: ['http://localhost:5173']
        headers: [
          'Accept',
          'Authorization', 
          'Content-Type',
          'If-None-Match',
          'Origin',
          'X-Requested-With'
        ],
        exposedHeaders: [
          'WWW-Authenticate', 
          'Server-Authorization'
        ],
        additionalExposedHeaders: [
          'Accept', 
          'Authorization', 
          'Content-Type', 
          'If-None-Match'
        ],
        maxAge: 86400, // 24 hours
        credentials: true
      },
      validate: {
        options: {
          abortEarly: false
        }
      }
    },
  });

  // Plugin untuk menangani CORS secara lebih baik
  await server.register({
    plugin: {
      name: 'cors-plugin',
      register: async function (server, options) {
        server.ext('onPreResponse', (request, h) => {
          const response = request.response;
          
          if (response.isBoom) {
            // Handle CORS for error responses
            response.output.headers['Access-Control-Allow-Origin'] = '*';
            response.output.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            response.output.headers['Access-Control-Allow-Headers'] = 'Accept, Authorization, Content-Type, If-None-Match, Origin, X-Requested-With';
            response.output.headers['Access-Control-Allow-Credentials'] = 'true';
          } else {
            // Handle CORS for successful responses
            response.header('Access-Control-Allow-Origin', '*');
            response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            response.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, If-None-Match, Origin, X-Requested-With');
            response.header('Access-Control-Allow-Credentials', 'true');
          }
          
          return h.continue;
        });
      }
    }
  });

  // Handle OPTIONS requests (preflight)
  server.route({
    method: 'OPTIONS',
    path: '/{any*}',
    handler: (request, h) => {
      return h.response()
        .code(200)
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        .header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, If-None-Match, Origin, X-Requested-With')
        .header('Access-Control-Allow-Credentials', 'true')
        .header('Access-Control-Max-Age', '86400');
    }
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