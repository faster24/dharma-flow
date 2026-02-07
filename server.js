require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const initFirebase = require('./src/config/firebase');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const MAX_PORT_TRIES = 5;

const start = async () => {
  try {
    await connectDB();
    initFirebase();
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }

  const server = http.createServer(app);

  const listenOnPort = (port, attempt = 1) => {
    server.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_TRIES) {
        const nextPort = port + 1;
        console.warn(`Port ${port} in use. Trying ${nextPort}...`);
        server.close();
        listenOnPort(nextPort, attempt + 1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  };

  listenOnPort(DEFAULT_PORT);
};

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Gracefully shutting down...');
  process.exit(0);
});
