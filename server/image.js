// utils/image.js

export function getImageUrl(key) {
  const base = import.meta.env.VITE_CDN_URL;
  if (!base) {
    console.warn('VITE_CDN_URL is not defined');
    return key; // fallback กลับ key เดิม ถ้า .env ยังไม่ได้ตั้งค่า
  }

  const cleanKey = key.replace(/^\/+/, ''); // ลบ / หน้า key ถ้ามี
  return `${base}/${cleanKey}`;
}
