const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { randomUUID } = require('crypto');

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'storage', 'user-images');

const saveProfileImage = async (buffer, mimetype) => {
  const id = randomUUID();
  const ext = mimetype === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${id}.${ext}`;
  const filepath = path.join(OUTPUT_DIR, filename);

  await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .toFormat(ext === 'webp' ? 'webp' : 'jpeg', { quality: 80 })
    .toFile(filepath);

  return `/storage/user-images/${filename}`;
};

module.exports = {
  saveProfileImage,
};
