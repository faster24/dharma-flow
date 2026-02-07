const { Router } = require('express');
const auth = require('../middleware/auth');
const { health, echo, profile } = require('../controllers/testController');

const router = Router();

router.get('/health', health);
router.post('/echo', echo);
router.get('/profile', auth, profile);

module.exports = router;
