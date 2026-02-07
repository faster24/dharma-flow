const initFirebase = require('../config/firebase');

const authMiddleware = async (req, res, next) => {
  try {
    if (process.env.TEST_BYPASS_AUTH === 'true') {
      req.user = {
        uid: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
      };
      return next();
    }

    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing Authorization header' });
    }

    const idToken = authorization.replace('Bearer ', '').trim();
    const firebaseApp = initFirebase();
    const decodedToken = await firebaseApp.auth().verifyIdToken(idToken);

    req.user = decodedToken;
    return next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ message: 'Unauthorized', error: err.message });
  }
};

module.exports = authMiddleware;
