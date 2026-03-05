const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const {
  USER_IMAGES_DIR,
  SUTRA_THUMBS_DIR,
  DHARMA_THUMBS_DIR,
  SUTRA_AUDIO_DIR,
} = require('../config/storage');

const mimeToExtension = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const getImageExtension = (mimetype) => mimeToExtension[mimetype] || 'jpg';

const getUploadExtension = (originalName, mimetype) => {
  const rawExt = path.extname(originalName || '').toLowerCase();
  const normalized = rawExt.startsWith('.') ? rawExt.slice(1) : rawExt;
  if (/^[a-z0-9]+$/.test(normalized)) {
    return normalized;
  }
  return getImageExtension(mimetype);
};

const hasPngSignature = (buffer) => {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  return signature.every((byte, index) => buffer[index] === byte);
};

const hasJpegSignature = (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

const hasWebpSignature = (buffer) => {
  if (buffer.length < 12) {
    return false;
  }
  return (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  );
};

const validateImageContent = (buffer, mimetype) => {
  const validators = {
    'image/png': hasPngSignature,
    'image/jpeg': hasJpegSignature,
    'image/jpg': hasJpegSignature,
    'image/webp': hasWebpSignature,
  };

  const validator = validators[mimetype];
  if (!validator) {
    return;
  }

  if (!Buffer.isBuffer(buffer) || !validator(buffer)) {
    throw new Error('Invalid image content');
  }
};

const saveImage = async (buffer, mimetype, originalName, directory, urlPrefix) => {
  validateImageContent(buffer, mimetype);

  const id = randomUUID();
  const ext = getUploadExtension(originalName, mimetype);
  const filename = `${id}.${ext}`;
  const filepath = path.join(directory, filename);

  await fs.promises.writeFile(filepath, buffer);

  return `${urlPrefix}/${filename}`;
};

const saveProfileImage = async (buffer, mimetype, originalName) => {
  return saveImage(buffer, mimetype, originalName, USER_IMAGES_DIR, '/storage/user-images');
};

const saveSutraThumbnail = async (buffer, mimetype, originalName) => {
  return saveImage(buffer, mimetype, originalName, SUTRA_THUMBS_DIR, '/storage/sutra-thumbs');
};

const saveDharmaThumbnail = async (buffer, mimetype, originalName) => {
  return saveImage(buffer, mimetype, originalName, DHARMA_THUMBS_DIR, '/storage/dharma-thumbs');
};

module.exports = {
  saveProfileImage,
  saveSutraThumbnail,
  saveDharmaThumbnail,
  SUTRA_AUDIO_DIR,
};
