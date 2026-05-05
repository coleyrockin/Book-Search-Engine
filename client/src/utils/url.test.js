import test from 'node:test';
import assert from 'node:assert/strict';

import { safeHttpsUrl } from './url.js';

test('safeHttpsUrl keeps valid HTTPS URLs', () => {
  assert.equal(
    safeHttpsUrl('https://books.google.com/books?id=abc'),
    'https://books.google.com/books?id=abc'
  );
});

test('safeHttpsUrl upgrades HTTP URLs to HTTPS', () => {
  assert.equal(
    safeHttpsUrl('http://books.google.com/books?id=abc'),
    'https://books.google.com/books?id=abc'
  );
});

test('safeHttpsUrl rejects active and malformed URLs', () => {
  assert.equal(safeHttpsUrl('javascript:alert(1)'), '');
  assert.equal(safeHttpsUrl('data:text/html,<script>alert(1)</script>'), '');
  assert.equal(safeHttpsUrl('not a url'), '');
  assert.equal(safeHttpsUrl(''), '');
});
