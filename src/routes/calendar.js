const { Router } = require('express');
const auth = require('../middleware/auth');
const { addChant, getMonth, getStreak } = require('../controllers/calendarController');

const router = Router();

router.post('/chant', auth, addChant);
router.get('/', auth, getMonth);
router.get('/streak', auth, getStreak);

module.exports = router;
