const { Router } = require('express');
const auth = require('../middleware/auth');
const { addFavorite, removeFavorite, listFavorites } = require('../controllers/favoriteController');

const router = Router();

router.get('/', auth, listFavorites);
router.post('/:id', auth, addFavorite);
router.delete('/:id', auth, removeFavorite);

module.exports = router;
