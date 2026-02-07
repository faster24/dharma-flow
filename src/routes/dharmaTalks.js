const { Router } = require('express');
const auth = require('../middleware/auth');
const uploadDharmaMedia = require('../middleware/uploadDharmaMedia');
const {
  createTalk,
  listTalks,
  getTalk,
  updateTalk,
  deleteTalk,
} = require('../controllers/dharmaTalkController');

const router = Router();

router.get('/', listTalks);
router.get('/:id', getTalk);
router.post('/', auth, uploadDharmaMedia.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), createTalk);
router.patch('/:id', auth, uploadDharmaMedia.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), updateTalk);
router.delete('/:id', auth, deleteTalk);

module.exports = router;
