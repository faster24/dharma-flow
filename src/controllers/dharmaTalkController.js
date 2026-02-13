const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { randomUUID } = require('crypto');
const Monk = require('../models/Monk');
const DharmaTalk = require('../models/DharmaTalk');
const { DHARMA_THUMBS_DIR, DHARMA_AUDIO_DIR } = require('../config/storage');
const { normalizeTags } = require('../utils/validation');

const saveThumb = async (file) => {
  const ext = file.mimetype === 'image/webp' ? 'webp' : 'jpg';
  const filename = `${randomUUID()}.${ext}`;
  const filepath = path.join(DHARMA_THUMBS_DIR, filename);
  await sharp(file.buffer)
    .resize({ width: 800, withoutEnlargement: true })
    .toFormat(ext === 'webp' ? 'webp' : 'jpeg', { quality: 80 })
    .toFile(filepath);
  return `/storage/dharma-thumbs/${filename}`;
};

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
    return `/storage/dharma-audio/${filename}`;
  }
  const filepath = path.join(DHARMA_AUDIO_DIR, filename);
  fs.writeFileSync(filepath, file.buffer);
  return `/storage/dharma-audio/${filename}`;
};

const createTalk = async (req, res) => {
  try {
    const { monk, title, description, tags = [], duration, type = 'audio' } = req.body || {};
    if (!monk || !title || !duration) {
      return res.status(400).json({ message: 'monk, title, and duration are required' });
    }
    if (type !== 'audio') return res.status(400).json({ message: 'type must be audio' });
    const durNumber = Number(duration);
    if (!Number.isFinite(durNumber) || durNumber <= 0) return res.status(400).json({ message: 'duration must be a positive number' });

    const monkDoc = await Monk.findOne({ _id: monk, isDeleted: false });
    if (!monkDoc) return res.status(400).json({ message: 'monk not found or deleted' });

    const thumbFile = req.files?.thumbnail?.[0];
    const audioFile = req.files?.audio?.[0];
    if (!audioFile) return res.status(400).json({ message: 'audio file is required' });

    const thumbnailUrl = thumbFile ? await saveThumb(thumbFile) : undefined;
    const audioUrl = saveAudio(audioFile);

    const talk = await DharmaTalk.create({
      monk,
      title: title.trim(),
      description,
      tags: normalizeTags(tags),
      duration: durNumber,
      audioUrl,
      thumbnailUrl,
      type,
    });

    res.status(201).json({ talk });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create dharma talk', error: err.message });
  }
};

const listTalks = async (req, res) => {
  const { page = 1, limit = 20, monk, monkName, search = '', tag } = req.query;
  const query = {};
  if (monk) query.monk = monk;
  if (search)
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  if (tag) query.tags = tag.toLowerCase();

  if (monkName) {
    const monkMatches = await Monk.find({ name: { $regex: monkName, $options: 'i' }, isDeleted: false }).select('_id');
    const ids = monkMatches.map((m) => m._id);
    if (!ids.length) return res.json({ items: [], total: 0, page: Number(page), limit: Number(limit) });
    query.monk = { $in: ids };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    DharmaTalk.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate({ path: 'monk', match: { isDeleted: false } }),
    DharmaTalk.countDocuments(query),
  ]);

  res.json({ items, total, page: Number(page), limit: Number(limit) });
};

const getTalk = async (req, res) => {
  const { id } = req.params;
  const talk = await DharmaTalk.findById(id).populate({ path: 'monk', match: { isDeleted: false } });
  if (!talk) return res.status(404).json({ message: 'Dharma talk not found' });
  res.json({ talk });
};

const updateTalk = async (req, res) => {
  try {
    const { id } = req.params;
    const { monk, title, description, tags, duration, type } = req.body || {};
    const talk = await DharmaTalk.findById(id);
    if (!talk) return res.status(404).json({ message: 'Dharma talk not found' });

    if (type && type !== 'audio') return res.status(400).json({ message: 'type must be audio' });

    if (monk) {
      const monkDoc = await Monk.findOne({ _id: monk, isDeleted: false });
      if (!monkDoc) return res.status(400).json({ message: 'monk not found or deleted' });
      talk.monk = monk;
    }

    if (title) talk.title = title.trim();
    if (description !== undefined) talk.description = description;
    if (tags !== undefined) talk.tags = normalizeTags(tags);
    if (duration !== undefined) {
      const durNumber = Number(duration);
      if (!Number.isFinite(durNumber) || durNumber <= 0) return res.status(400).json({ message: 'duration must be a positive number' });
      talk.duration = durNumber;
    }

    const thumbFile = req.files?.thumbnail?.[0];
    const audioFile = req.files?.audio?.[0];

    if (thumbFile) talk.thumbnailUrl = await saveThumb(thumbFile);
    if (audioFile) talk.audioUrl = saveAudio(audioFile);

    await talk.save();
    res.json({ talk });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update dharma talk', error: err.message });
  }
};

const deleteTalk = async (req, res) => {
  const { id } = req.params;
  const talk = await DharmaTalk.findById(id);
  if (!talk) return res.status(404).json({ message: 'Dharma talk not found' });
  await talk.deleteOne();
  res.json({ message: 'Dharma talk deleted' });
};

module.exports = {
  createTalk,
  listTalks,
  getTalk,
  updateTalk,
  deleteTalk,
};
