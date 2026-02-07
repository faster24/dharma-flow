const User = require('../models/User');

const health = (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
};

const echo = (req, res) => {
  res.json({ data: req.body || {}, message: 'echo' });
};

const profile = async (req, res) => {
  const { uid, email, name, picture } = req.user || {};

  try {
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: 'User not found; register first' });
    }

    res.json({
      authUser: req.user,
      user,
    });
  } catch (err) {
    console.error('Profile error:', err.message);
    res.status(500).json({ message: 'Failed to load profile', error: err.message });
  }
};

module.exports = {
  health,
  echo,
  profile,
};
