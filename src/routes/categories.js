const { Router } = require('express');
const auth = require('../middleware/auth');
const {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', auth, createCategory);
router.patch('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);

module.exports = router;
