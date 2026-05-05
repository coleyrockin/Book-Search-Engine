export const safeHttpsUrl = (value) => {
  const rawValue = String(value || '').trim();

  if (!rawValue) {
    return '';
  }

  try {
    const url = new URL(rawValue.replace(/^http:\/\//i, 'https://'));
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
};
