require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const path = require('path');
const { connectDb } = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

const PORT = process.env.PORT || 3001;
const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true,
};

const contentSecurityPolicy = {
  useDefaults: false,
  directives: {
    defaultSrc: ["'self'"],
    baseUri: ["'self'"],
    connectSrc: ["'self'", 'https://www.googleapis.com'],
    fontSrc: ["'self'", 'data:'],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    imgSrc: [
      "'self'",
      'data:',
      'https://books.google.com',
      'https://*.googleusercontent.com',
      'https://*.gstatic.com',
    ],
    objectSrc: ["'none'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
  },
};

const graphQLLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
});

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  next();
});
app.use(
  helmet({
    contentSecurityPolicy,
    crossOriginEmbedderPolicy: false,
  })
);

const startApolloServer = async () => {
  await server.start();

  app.use(
    '/graphql',
    graphQLLimiter,
    cors(corsOptions),
    express.json({ limit: '1mb' }),
    expressMiddleware(server, {
      context: async ({ req }) => authMiddleware({ req }),
    })
  );

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('/{*splat}', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    const message = status === 500 ? 'Internal server error' : err.message;

    if (status === 500) {
      console.error(err);
    }

    res.status(status).json({ message });
  });

  await connectDb();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL ready at http://localhost:${PORT}/graphql`);
  });
};

if (require.main === module) {
  startApolloServer().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

module.exports = { app, server, startApolloServer };
