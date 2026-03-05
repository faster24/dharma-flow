const Monk = require('../models/Monk');
const DharmaTalk = require('../models/DharmaTalk');
const { saveDharmaThumbnail } = require('../services/imageService');

const createMonk = async (req, res) => {
  try {
    const { name, bio } = req.body || {};
    if (!name) return res.status(400).json({ message: 'name is required' });

    const existing = await Monk.findOne({ name: name.trim() });
    if (existing) return res.status(409).json({ message: 'monk already exists' });

    let avatarUrl;
    const avatarFile = req.files?.thumbnail?.[0] || req.files?.avatar?.[0];
    if (avatarFile) {
      avatarUrl = await saveDharmaThumbnail(avatarFile.buffer, avatarFile.mimetype, avatarFile.originalname);
    }

    const monk = await Monk.create({ name: name.trim(), bio, avatarUrl });
    res.status(201).json({ monk });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create monk', error: err.message });
  }
};

const listMonks = async (req, res) => {
  const { search = '', page = 1, limit = 20 } = req.query;
  const query = { isDeleted: false };
  if (search) query.name = { $regex: search, $options: 'i' };
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Monk.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Monk.countDocuments(query),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
};

const getMonk = async (req, res) => {
  const { id } = req.params;
  const monk = await Monk.findOne({ _id: id, isDeleted: false });
  if (!monk) return res.status(404).json({ message: 'Monk not found' });
  res.json({ monk });
};

const updateMonk = async (req, res) => {
  const { id } = req.params;
  const { name, bio } = req.body || {};
  const monk = await Monk.findOne({ _id: id, isDeleted: false });
  if (!monk) return res.status(404).json({ message: 'Monk not found' });

  if (name) {
    const exists = await Monk.findOne({ name: name.trim(), _id: { $ne: id } });
    if (exists) return res.status(409).json({ message: 'monk already exists' });
    monk.name = name.trim();
  }
  if (bio !== undefined) monk.bio = bio;

  const avatarFile = req.files?.thumbnail?.[0] || req.files?.avatar?.[0];
  if (avatarFile) monk.avatarUrl = await saveDharmaThumbnail(avatarFile.buffer, avatarFile.mimetype, avatarFile.originalname);

  await monk.save();
  res.json({ monk });
};

const deleteMonk = async (req, res) => {
  const { id } = req.params;
  const monk = await Monk.findById(id);
  if (!monk || monk.isDeleted) return res.status(404).json({ message: 'Monk not found' });

  const talks = await DharmaTalk.countDocuments({ monk: id });
  if (talks > 0) {
    monk.isDeleted = true;
    await monk.save();
    return res.json({ message: 'Monk soft-deleted due to existing dharma talks', monk });
  }

  await monk.deleteOne();
  res.json({ message: 'Monk deleted' });
};

module.exports = {
  createMonk,
  listMonks,
  getMonk,
  updateMonk,
  deleteMonk,
};
