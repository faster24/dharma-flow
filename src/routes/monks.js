const { Router } = require('express');
const auth = require('../middleware/auth');
const uploadDharmaMedia = require('../middleware/uploadDharmaMedia');
const {
  createMonk,
  listMonks,
  getMonk,
  updateMonk,
  deleteMonk,
} = require('../controllers/monkController');

const router = Router();

router.get('/', listMonks);
router.get('/:id', getMonk);
router.post('/', auth, uploadDharmaMedia.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), createMonk);
router.patch('/:id', auth, uploadDharmaMedia.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'avatar', maxCount: 1 }]), updateMonk);
router.delete('/:id', auth, deleteMonk);

module.exports = router;
