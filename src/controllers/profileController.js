const User = require('../models/User');
const { saveProfileImage } = require('../services/imageService');

const parseBirthday = (birthday) => {
  if (!birthday) return undefined;
  const date = new Date(birthday);
  return Number.isNaN(date.getTime()) ? null : date;
};

const updateProfile = async (req, res) => {
  const { username, birthday } = req.body || {};
  const parsedBirthday = parseBirthday(birthday);
  if (birthday && parsedBirthday === null) {
    return res.status(400).json({ message: 'birthday must be YYYY-MM-DD' });
  }

  try {
    const existingUser = await User.findOne({ uid: req.user.uid });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found; register first' });
    }

    const updates = {};

    if (username) {
      const existing = await User.findOne({ username, uid: { $ne: req.user.uid } });
      if (existing) {
        return res.status(409).json({ message: 'username already taken' });
      }
      updates.username = username.trim();
    }

    if (parsedBirthday) {
      updates.birthday = parsedBirthday;
    }

    if (req.file) {
      const url = await saveProfileImage(req.file.buffer, req.file.mimetype);
      updates.photoURL = url;
    }

    const user = await User.findOneAndUpdate({ uid: req.user.uid }, updates, {
      new: true,
    });

    res.json({ user });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

module.exports = { updateProfile };
