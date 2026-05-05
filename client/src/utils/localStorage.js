const parseSavedBookIds = (value) => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem('saved_books');
    return [];
  }
};

export const getSavedBookIds = () => {
  return parseSavedBookIds(localStorage.getItem('saved_books'));
};

export const saveBookIds = (bookIdArr) => {
  if (Array.isArray(bookIdArr) && bookIdArr.length) {
    localStorage.setItem('saved_books', JSON.stringify([...new Set(bookIdArr)]));
  } else {
    localStorage.removeItem('saved_books');
  }
};

export const removeBookId = (bookId) => {
  const savedBookIds = parseSavedBookIds(localStorage.getItem('saved_books'));

  if (!bookId) {
    return false;
  }

  const updatedSavedBookIds = savedBookIds.filter((savedBookId) => savedBookId !== bookId);
  saveBookIds(updatedSavedBookIds);

  return true;
};
