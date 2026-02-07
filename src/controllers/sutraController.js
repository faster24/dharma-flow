const Category = require('../models/Category');
const Sutra = require('../models/Sutra');
const { saveSutraThumbnail } = require('../services/imageService');

const createSutra = async (req, res) => {
  try {
    const { category, title, content, summary, tags = [] } = req.body || {};
    if (!category || !title || !content) {
      return res.status(400).json({ message: 'category, title, and content are required' });
    }

    const cat = await Category.findOne({ _id: category, isDeleted: false });
    if (!cat) return res.status(400).json({ message: 'category not found or deleted' });

    let thumbnailUrl;
    if (req.file) {
      thumbnailUrl = await saveSutraThumbnail(req.file.buffer, req.file.mimetype);
    }

    const normalizedTags = Array.isArray(tags)
      ? tags.map((t) => (t || '').toString().trim().toLowerCase()).filter(Boolean)
      : [];

    const sutra = await Sutra.create({
      category,
      title: title.trim(),
      content,
      summary,
      tags: normalizedTags,
      thumbnailUrl,
    });

    res.status(201).json({ sutra });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create sutra', error: err.message });
  }
};

const listSutras = async (req, res) => {
  const { page = 1, limit = 20, category, search = '', tag } = req.query;
  const query = {};
  if (category) query.category = category;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { content: { $regex: search, $options: 'i' } },
    { summary: { $regex: search, $options: 'i' } },
  ];
  if (tag) query.tags = tag.toLowerCase();

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Sutra.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({ path: 'category', match: { isDeleted: false } }),
    Sutra.countDocuments(query),
  ]);

  res.json({ items, total, page: Number(page), limit: Number(limit) });
};

const getSutra = async (req, res) => {
  const { id } = req.params;
  const sutra = await Sutra.findById(id).populate({ path: 'category', match: { isDeleted: false } });
  if (!sutra) return res.status(404).json({ message: 'Sutra not found' });
  res.json({ sutra });
};

const updateSutra = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, title, content, summary, tags } = req.body || {};
    const sutra = await Sutra.findById(id);
    if (!sutra) return res.status(404).json({ message: 'Sutra not found' });

    if (category) {
      const cat = await Category.findOne({ _id: category, isDeleted: false });
      if (!cat) return res.status(400).json({ message: 'category not found or deleted' });
      sutra.category = category;
    }

    if (title) sutra.title = title.trim();
    if (content) sutra.content = content;
    if (summary !== undefined) sutra.summary = summary;
    if (tags !== undefined) {
      const normalizedTags = Array.isArray(tags)
        ? tags.map((t) => (t || '').toString().trim().toLowerCase()).filter(Boolean)
        : [];
      sutra.tags = normalizedTags;
    }

    if (req.file) {
      const url = await saveSutraThumbnail(req.file.buffer, req.file.mimetype);
      sutra.thumbnailUrl = url;
    }

    await sutra.save();
    res.json({ sutra });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update sutra', error: err.message });
  }
};

const deleteSutra = async (req, res) => {
  const { id } = req.params;
  const sutra = await Sutra.findById(id);
  if (!sutra) return res.status(404).json({ message: 'Sutra not found' });
  await sutra.deleteOne();
  res.json({ message: 'Sutra deleted' });
};

module.exports = {
  createSutra,
  listSutras,
  getSutra,
  updateSutra,
  deleteSutra,
};
