const app = require('../src/app');
const connectDB = require('../src/config/db');
const initFirebase = require('../src/config/firebase');

let initialized = false;
let initPromise;

const ensureInit = async () => {
  if (initialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      initFirebase();
      initialized = true;
    })();
  }
  return initPromise;
};

module.exports = async (req, res) => {
  try {
    await ensureInit();
    return app(req, res);
  } catch (err) {
    console.error('Startup error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
};
