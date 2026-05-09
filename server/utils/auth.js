const jwt = require('jsonwebtoken');

const MIN_SECRET_LENGTH = 32;
const configuredSecret = process.env.JWT_SECRET?.trim();

if (!configuredSecret) {
  throw new Error('JWT_SECRET must be set before starting the server.');
}

if (configuredSecret.length < MIN_SECRET_LENGTH) {
  throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters.`);
}

const secret = configuredSecret;
const expiration = process.env.JWT_EXPIRATION || '2h';

const getTokenFromRequest = (req) => {
  const authHeader = req.headers?.authorization || '';

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return '';
};

module.exports = {
  authMiddleware: ({ req }) => {
    const token = getTokenFromRequest(req);

    if (!token) {
      return {};
    }

    try {
      const { data } = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        maxAge: expiration,
      });

      return { user: data };
    } catch {
      return {};
    }
  },
  signToken: ({ username, email, _id }) => {
    const payload = { username, email, _id: _id.toString() };

    return jwt.sign({ data: payload }, secret, {
      algorithm: 'HS256',
      expiresIn: expiration,
    });
  },
};
