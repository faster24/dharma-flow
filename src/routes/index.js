const { Router } = require('express');
const auth = require('../middleware/auth');
const { health, echo, profile } = require('../controllers/testController');
const { register, login } = require('../controllers/authController');

const router = Router();

router.get('/health', health);
router.post('/echo', echo);
router.get('/profile', auth, profile);
router.post('/auth/register', register);
router.post('/auth/login', login);

module.exports = router;
