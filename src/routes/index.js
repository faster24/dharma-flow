const { Router } = require('express');
const auth = require('../middleware/auth');
const { health, echo, profile } = require('../controllers/testController');
const { register, login } = require('../controllers/authController');
const { updateProfile } = require('../controllers/profileController');
const upload = require('../middleware/upload');
const monkRoutes = require('./monks');
const dharmaTalkRoutes = require('./dharmaTalks');
const categoryRoutes = require('./categories');
const sutraRoutes = require('./sutras');
const { search } = require('../controllers/searchController');

const router = Router();

router.get('/health', health);
router.post('/echo', echo);
router.get('/profile', auth, profile);
router.patch('/profile', auth, upload.single('image'), updateProfile);
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/search', search);
router.use('/monks', monkRoutes);
router.use('/dharma-talks', dharmaTalkRoutes);
router.use('/categories', categoryRoutes);
router.use('/sutras', sutraRoutes);

module.exports = router;
