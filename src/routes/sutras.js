const { Router } = require('express');
const auth = require('../middleware/auth');
const uploadSutraMedia = require('../middleware/uploadSutraMedia');
const {
  createSutra,
  listSutras,
  getSutra,
  updateSutra,
  deleteSutra,
} = require('../controllers/sutraController');

const router = Router();

router.get('/', listSutras);
router.get('/:id', getSutra);
router.post('/', auth, uploadSutraMedia.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), createSutra);
router.patch('/:id', auth, uploadSutraMedia.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), updateSutra);
router.delete('/:id', auth, deleteSutra);

module.exports = router;
