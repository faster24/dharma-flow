const multer = require('multer');

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const allowed = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'));
  }
  cb(null, true);
};

const uploadThumb = multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter });

module.exports = uploadThumb;
