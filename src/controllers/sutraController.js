const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const Category = require('../models/Category');
const Sutra = require('../models/Sutra');
const { saveSutraThumbnail, SUTRA_AUDIO_DIR } = require('../services/imageService');

const normalizeTags = (tags) =>
  Array.isArray(tags)
    ? tags.map((t) => (t || '').toString().trim().toLowerCase()).filter(Boolean)
    : [];

const ensureType = (type) => (['text', 'audio'].includes(type || '') ? type : null);

const saveAudio = (file) => {
  const extMap = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/x-m4a': 'm4a',
    'audio/mp4': 'm4a',
    'audio/wav': 'wav',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
  };
  const ext = extMap[file.mimetype] || 'bin';
  const filename = `${randomUUID()}.${ext}`;
  if (process.env.TEST_NO_WRITE === 'true') {
    return `/storage/sutra-audio/${filename}`;
  }
  const filepath = path.join(SUTRA_AUDIO_DIR, filename);
  fs.writeFileSync(filepath, file.buffer);
  return `/storage/sutra-audio/${filename}`;
};

const createSutra = async (req, res) => {
  try {
    const { category, title, content, summary, tags = [], type } = req.body || {};
    if (!category || !title || !content || !type) {
      return res.status(400).json({ message: 'category, title, content, and type are required' });
    }

    const sutraType = ensureType(type);
    if (!sutraType) return res.status(400).json({ message: 'type must be text or audio' });

    const cat = await Category.findOne({ _id: category, isDeleted: false });
    if (!cat) return res.status(400).json({ message: 'category not found or deleted' });

    const thumbFile = req.files?.thumbnail?.[0];
    const audioFile = req.files?.audio?.[0];

    let thumbnailUrl;
    let audioUrl;

    if (thumbFile) {
      thumbnailUrl = await saveSutraThumbnail(thumbFile.buffer, thumbFile.mimetype);
    }

    if (audioFile) {
      audioUrl = saveAudio(audioFile);
    }

    const sutra = await Sutra.create({
      category,
      title: title.trim(),
      content,
      summary,
      tags: normalizeTags(tags),
      thumbnailUrl,
      audioUrl,
      type: sutraType,
    });

    res.status(201).json({ sutra });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create sutra', error: err.message });
  }
};

const listSutras = async (req, res) => {
  const { page = 1, limit = 20, category, search = '', tag, type } = req.query;
  const query = {};
  if (category) query.category = category;
  if (search)
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { summary: { $regex: search, $options: 'i' } },
    ];
  if (tag) query.tags = tag.toLowerCase();
  if (type) query.type = type;

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
    const { category, title, content, summary, tags, type } = req.body || {};
    const sutra = await Sutra.findById(id);
    if (!sutra) return res.status(404).json({ message: 'Sutra not found' });

    if (category) {
      const cat = await Category.findOne({ _id: category, isDeleted: false });
      if (!cat) return res.status(400).json({ message: 'category not found or deleted' });
      sutra.category = category;
    }

    if (type) {
      const sutraType = ensureType(type);
      if (!sutraType) return res.status(400).json({ message: 'type must be text or audio' });
      sutra.type = sutraType;
    }

    if (title) sutra.title = title.trim();
    if (content) sutra.content = content;
    if (summary !== undefined) sutra.summary = summary;
    if (tags !== undefined) sutra.tags = normalizeTags(tags);

    const thumbFile = req.files?.thumbnail?.[0];
    const audioFile = req.files?.audio?.[0];

    if (thumbFile) {
      const url = await saveSutraThumbnail(thumbFile.buffer, thumbFile.mimetype);
      sutra.thumbnailUrl = url;
    }

    if (audioFile) {
      sutra.audioUrl = saveAudio(audioFile);
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
