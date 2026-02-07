const { Router } = require('express');
const auth = require('../middleware/auth');
const { health, echo, profile } = require('../controllers/testController');
const { register, login } = require('../controllers/authController');
const { updateProfile } = require('../controllers/profileController');
const upload = require('../middleware/upload');
const categoryRoutes = require('./categories');
const sutraRoutes = require('./sutras');

const router = Router();

router.get('/health', health);
router.post('/echo', echo);
router.get('/profile', auth, profile);
router.patch('/profile', auth, upload.single('image'), updateProfile);
router.post('/auth/register', register);
router.post('/auth/login', login);
router.use('/categories', categoryRoutes);
router.use('/sutras', sutraRoutes);

module.exports = router;
