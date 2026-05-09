const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET ||= 'test-secret-with-at-least-32-characters';

const { authMiddleware, signToken } = require('../utils/auth');
const authModulePath = require.resolve('../utils/auth');

const requestWithToken = (authorization) => ({
  headers: { authorization },
  body: {},
  query: {},
});

test('signToken creates a verifiable HS256 token payload', () => {
  const token = signToken({
    username: 'reader',
    email: 'reader@example.com',
    _id: '507f1f77bcf86cd799439011',
  });

  const decoded = jwt.decode(token, { complete: true });

  assert.equal(decoded.header.alg, 'HS256');
  assert.equal(decoded.payload.data.email, 'reader@example.com');
  assert.equal(decoded.payload.data._id, '507f1f77bcf86cd799439011');
});

test('authMiddleware returns user data for a valid bearer token', () => {
  const token = signToken({
    username: 'reader',
    email: 'reader@example.com',
    _id: '507f1f77bcf86cd799439011',
  });

  const context = authMiddleware({ req: requestWithToken(`Bearer ${token}`) });

  assert.equal(context.user.email, 'reader@example.com');
  assert.equal(context.user._id, '507f1f77bcf86cd799439011');
});

test('authMiddleware rejects missing and malformed tokens without throwing', () => {
  assert.deepEqual(authMiddleware({ req: requestWithToken('') }), {});
  assert.deepEqual(authMiddleware({ req: requestWithToken('Bearer not-a-real-token') }), {});
});

test('authMiddleware only accepts bearer tokens from the Authorization header', () => {
  const token = signToken({
    username: 'reader',
    email: 'reader@example.com',
    _id: '507f1f77bcf86cd799439011',
  });

  assert.deepEqual(authMiddleware({ req: { headers: {}, body: { token }, query: {} } }), {});
  assert.deepEqual(authMiddleware({ req: { headers: {}, body: {}, query: { token } } }), {});
  assert.deepEqual(authMiddleware({ req: requestWithToken(token) }), {});
});

test('authMiddleware does not accept non-HS256 tokens', () => {
  const token = jwt.sign(
    { data: { username: 'reader', email: 'reader@example.com', _id: '507f1f77bcf86cd799439011' } },
    process.env.JWT_SECRET,
    { algorithm: 'HS384', expiresIn: '2h' }
  );

  assert.deepEqual(authMiddleware({ req: requestWithToken(`Bearer ${token}`) }), {});
});

test('auth module requires a strong JWT_SECRET at startup', () => {
  const originalSecret = process.env.JWT_SECRET;

  try {
    delete require.cache[authModulePath];
    delete process.env.JWT_SECRET;
    assert.throws(() => require('../utils/auth'), /JWT_SECRET must be set/);

    delete require.cache[authModulePath];
    process.env.JWT_SECRET = 'short-secret';
    assert.throws(() => require('../utils/auth'), /at least 32 characters/);
  } finally {
    process.env.JWT_SECRET = originalSecret;
    delete require.cache[authModulePath];
    require('../utils/auth');
  }
});
