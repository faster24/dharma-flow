const Category = require('../models/Category');
const Sutra = require('../models/Sutra');

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name is required' });

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ message: 'category already exists' });

    const category = await Category.create({ name: name.trim(), description });
    res.status(201).json({ category });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create category', error: err.message });
  }
};

const listCategories = async (req, res) => {
  const { search = '', page = 1, limit = 20 } = req.query;
  const query = { isDeleted: false };
  if (search) query.name = { $regex: search, $options: 'i' };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Category.countDocuments(query),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
};

const getCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findOne({ _id: id, isDeleted: false });
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json({ category });
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body || {};
  const category = await Category.findOne({ _id: id, isDeleted: false });
  if (!category) return res.status(404).json({ message: 'Category not found' });

  if (name) {
    const exists = await Category.findOne({ name: name.trim(), _id: { $ne: id } });
    if (exists) return res.status(409).json({ message: 'category already exists' });
    category.name = name.trim();
  }
  if (description !== undefined) category.description = description;
  await category.save();
  res.json({ category });
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category || category.isDeleted) return res.status(404).json({ message: 'Category not found' });

  const sutraCount = await Sutra.countDocuments({ category: id });
  if (sutraCount > 0) {
    category.isDeleted = true;
    await category.save();
    return res.json({ message: 'Category soft-deleted due to existing sutras', category });
  }

  await category.deleteOne();
  res.json({ message: 'Category deleted' });
};

module.exports = {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
