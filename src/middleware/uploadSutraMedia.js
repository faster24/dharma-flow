const multer = require('multer');

const allowed = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mpeg',
  'audio/mp3',
  'audio/x-m4a',
  'audio/mp4',
  'audio/wav',
  'audio/webm',
  'audio/ogg',
];

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'));
  }
  cb(null, true);
};

const uploadSutraMedia = multer({ storage, fileFilter });

module.exports = uploadSutraMedia;
