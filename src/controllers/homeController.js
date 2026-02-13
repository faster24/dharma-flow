const Sutra = require('../models/Sutra');

const getHome = async (req, res) => {
  try {
    const featuredTextSutra = await Sutra.findOne({ type: 'text' }).sort({ createdAt: -1 });
    const audioSutras = await Sutra.aggregate([{ $match: { type: 'audio' } }, { $sample: { size: 2 } }]);

    res.json({ featuredTextSutra, audioSutras });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load home data', error: err.message });
  }
};

module.exports = {
  getHome,
};
