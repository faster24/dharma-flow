const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { randomUUID } = require('crypto');

const PROFILE_DIR = path.join(process.cwd(), 'public', 'storage', 'user-images');
const SUTRA_DIR = path.join(process.cwd(), 'public', 'storage', 'sutra-thumbs');
const SUTRA_AUDIO_DIR = path.join(process.cwd(), 'public', 'storage', 'sutra-audio');

const saveProfileImage = async (buffer, mimetype) => {
  const id = randomUUID();
  const ext = mimetype === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${id}.${ext}`;
  const filepath = path.join(PROFILE_DIR, filename);

  await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .toFormat(ext === 'webp' ? 'webp' : 'jpeg', { quality: 80 })
    .toFile(filepath);

  return `/storage/user-images/${filename}`;
};

const saveSutraThumbnail = async (buffer, mimetype) => {
  const id = randomUUID();
  const ext = mimetype === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${id}.${ext}`;
  const filepath = path.join(SUTRA_DIR, filename);

  await sharp(buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .toFormat(ext === 'webp' ? 'webp' : 'jpeg', { quality: 80 })
    .toFile(filepath);

  return `/storage/sutra-thumbs/${filename}`;
};

module.exports = {
  saveProfileImage,
  saveSutraThumbnail,
  SUTRA_AUDIO_DIR,
};
