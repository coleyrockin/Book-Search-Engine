export const searchGoogleBooks = (query) => {
  const safeQuery = encodeURIComponent(String(query || '').trim());
  return fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${safeQuery}&printType=books&maxResults=20`
  );
};
