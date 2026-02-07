let authService = require('../services/firebaseAuth');

const setAuthService = (svc) => {
  authService = svc;
};

const ensureCredentials = (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return null;
  }
  return { email, password };
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
      });
    }

    const result = await authService.signUp(creds.email, creds.password);
    res.json({
      uid: result.localId,
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      email: result.email,
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
      });
    }

    const result = await authService.signIn(creds.email, creds.password);
    res.json({
      uid: result.localId,
      idToken: result.idToken,
      refreshToken: result.refreshToken,
      email: result.email,
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
