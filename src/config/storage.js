const os = require('os');
const path = require('path');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const STORAGE_ROOT = isServerless
  ? path.join(os.tmpdir(), 'dharma-flow-storage')
  : path.join(process.cwd(), 'public', 'storage');

const USER_IMAGES_DIR = path.join(STORAGE_ROOT, 'user-images');
const SUTRA_THUMBS_DIR = path.join(STORAGE_ROOT, 'sutra-thumbs');
const SUTRA_AUDIO_DIR = path.join(STORAGE_ROOT, 'sutra-audio');
const DHARMA_THUMBS_DIR = path.join(STORAGE_ROOT, 'dharma-thumbs');
const DHARMA_AUDIO_DIR = path.join(STORAGE_ROOT, 'dharma-audio');

module.exports = {
  isServerless,
  STORAGE_ROOT,
  USER_IMAGES_DIR,
  SUTRA_THUMBS_DIR,
  SUTRA_AUDIO_DIR,
  DHARMA_THUMBS_DIR,
  DHARMA_AUDIO_DIR,
};
