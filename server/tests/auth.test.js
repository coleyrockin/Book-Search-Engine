const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const { authMiddleware, signToken } = require('../utils/auth');

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

test('authMiddleware does not accept non-HS256 tokens', () => {
  const token = jwt.sign(
    { data: { username: 'reader', email: 'reader@example.com', _id: '507f1f77bcf86cd799439011' } },
    'dev-only-change-me',
    { algorithm: 'HS384', expiresIn: '2h' }
  );

  assert.deepEqual(authMiddleware({ req: requestWithToken(`Bearer ${token}`) }), {});
});
