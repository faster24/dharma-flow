const User = require('../models/User');
const { parseBirthday } = require('../utils/validation');
let authService = require('../services/firebaseAuth');

const setAuthService = (svc) => {
  authService = svc;
};

const ensureCredentials = (req, res) => {
  const { email, password, username, birthday } = req.body || {};
  if (!email || !password || !username) {
    res.status(400).json({ message: 'email, password and username are required' });
    return null;
  }

  const parsedBirthday = parseBirthday(birthday);
  if (birthday && parsedBirthday === null) {
    res.status(400).json({ message: 'birthday must be YYYY-MM-DD' });
    return null;
  }

  return { email, password, username, birthday: parsedBirthday };
};

const register = async (req, res) => {
  const creds = ensureCredentials(req, res);
  if (!creds) return;

  try {
    if (process.env.TEST_FAKE_AUTH === 'true') {
      return res.json({
        uid: 'test-user',
        idToken: 'fake-token',
        refreshToken: 'fake-refresh',
        email: creds.email,
        username: creds.username,
        birthday: creds.birthday,
      });
    }

    const existing = await User.findOne({ username: creds.username });
    if (existing) {
      return res.status(409).json({ message: 'username already taken' });
    }

    const result = await authService.signUp(creds.email, creds.password, creds.username, creds.birthday);
    try {
      await User.create({
        uid: result.localId,
        email: creds.email,
        username: creds.username.trim(),
        birthday: creds.birthday,
        displayName: creds.username,
      });
    } catch (dbErr) {
      // surface DB validation/unique errors
      if (dbErr.code === 11000) {
        return res.status(409).json({ message: 'username already taken' });
      }
      return res.status(500).json({ message: 'Failed to save user', error: dbErr.message });
    }

    res.json({
      uid: result.localId,
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      email: result.email,
      username: creds.username,
      birthday: creds.birthday,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, error: err.details });
  }
};

const login = async (req, res) => {
  const creds = ensureCredentials(req, res);
  if (!creds) return;

  try {
    if (process.env.TEST_FAKE_AUTH === 'true') {
      return res.json({
        uid: 'test-user',
        idToken: 'fake-token',
        refreshToken: 'fake-refresh',
        email: creds.email,
        username: creds.username,
        birthday: creds.birthday,
      });
    }

    const result = await authService.signIn(creds.email, creds.password);
    res.json({
      uid: result.localId,
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      email: result.email,
      username: creds.username,
      birthday: creds.birthday,
    });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message, error: err.details });
  }
};

module.exports = {
  register,
  login,
  setAuthService,
};
