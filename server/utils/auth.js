const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'dev-only-change-me';
const expiration = process.env.JWT_EXPIRATION || '2h';

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || '';

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return authHeader.trim() || req.body?.token || req.query?.token || '';
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
