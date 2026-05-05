import test from 'node:test';
import assert from 'node:assert/strict';

import { getSavedBookIds, removeBookId, saveBookIds } from './localStorage.js';

const createStorage = () => {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
};

test('saved book id helpers dedupe, remove, and clear values', () => {
  globalThis.localStorage = createStorage();

  saveBookIds(['a', 'a', 'b']);
  assert.deepEqual(getSavedBookIds(), ['a', 'b']);

  assert.equal(removeBookId('a'), true);
  assert.deepEqual(getSavedBookIds(), ['b']);

  saveBookIds([]);
  assert.deepEqual(getSavedBookIds(), []);
});

test('getSavedBookIds clears corrupted storage data safely', () => {
  globalThis.localStorage = createStorage();
  globalThis.localStorage.setItem('saved_books', '{bad-json');

  assert.deepEqual(getSavedBookIds(), []);
  assert.equal(globalThis.localStorage.getItem('saved_books'), null);
});
