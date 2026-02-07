const { Router } = require('express');
const auth = require('../middleware/auth');
const uploadThumb = require('../middleware/uploadThumb');
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
router.post('/', auth, uploadThumb.single('thumbnail'), createSutra);
router.patch('/:id', auth, uploadThumb.single('thumbnail'), updateSutra);
router.delete('/:id', auth, deleteSutra);

module.exports = router;
