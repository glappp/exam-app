export function getImageUrl(key) {
  const base = import.meta.env.VITE_CDN_URL;

  if (!base) {
    console.warn('VITE_CDN_URL is not defined');
    return key; // fallback
  }

  if (!key) {
    console.warn('Image key is missing');
    return '/fallback/question.png';
  }

  // 🔧 ลบ 'uploads/' + '/' ด้านหน้า
  const cleanKey = key
    .replace(/^\/?uploads\/+/, '')
    .replace(/^\/+/, '');

  return `${base}/${cleanKey}`;
}

export function normalizeImageKey(key) {
  return key?.replace(/^\/?uploads\/+/, '').replace(/^\/+/, '');
}
