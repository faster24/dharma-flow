const Favorite = require('../models/Favorite');
const Sutra = require('../models/Sutra');
const User = require('../models/User');

const ensureUser = async (uid) => {
  const user = await User.findOne({ uid });
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user;
};

const addFavorite = async (req, res) => {
  try {
    const { id: sutraId } = req.params;
    const user = await ensureUser(req.user.uid);
    const sutra = await Sutra.findById(sutraId);
    if (!sutra) return res.status(404).json({ message: 'Sutra not found' });

    await Favorite.updateOne(
      { user: user._id, sutra: sutra._id },
      { $setOnInsert: { user: user._id, sutra: sutra._id } },
      { upsert: true }
    );

    return res.json({ message: 'Favorited' });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { id: sutraId } = req.params;
    const user = await ensureUser(req.user.uid);
    await Favorite.deleteOne({ user: user._id, sutra: sutraId });
    return res.json({ message: 'Unfavorited' });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

const listFavorites = async (req, res) => {
  try {
    const user = await ensureUser(req.user.uid);
    const { page = 1, limit = 20, type, search = '', tag, category } = req.query;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 20, 1);

    const matchSutra = {};
    if (type) matchSutra.type = type;
    if (tag) matchSutra.tags = tag.toLowerCase();
    if (category) matchSutra.category = category;
    if (search) {
      matchSutra.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const pipeline = [
      { $match: { user: user._id } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'sutras',
          localField: 'sutra',
          foreignField: '_id',
          as: 'sutraDoc',
        },
      },
      { $unwind: '$sutraDoc' },
      { $match: matchSutra },
      {
        $project: {
          _id: 0,
          favoritedAt: '$createdAt',
          sutra: {
            _id: '$sutraDoc._id',
            title: '$sutraDoc.title',
            thumbnailUrl: '$sutraDoc.thumbnailUrl',
            type: '$sutraDoc.type',
            summary: '$sutraDoc.summary',
            tags: '$sutraDoc.tags',
          },
        },
      },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ];

    const countPipeline = [
      { $match: { user: user._id } },
      {
        $lookup: {
          from: 'sutras',
          localField: 'sutra',
          foreignField: '_id',
          as: 'sutraDoc',
        },
      },
      { $unwind: '$sutraDoc' },
      { $match: matchSutra },
      { $count: 'total' },
    ];

    const [items, totalRes] = await Promise.all([
      Favorite.aggregate(pipeline),
      Favorite.aggregate(countPipeline),
    ]);

    const total = totalRes[0]?.total || 0;
    return res.json({ items, total, page: pageNum, limit: limitNum });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { addFavorite, removeFavorite, listFavorites };
