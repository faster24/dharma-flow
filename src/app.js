const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const apiSpec = require('./docs/openapi.json');
const routes = require('./routes');
const path = require('path');
const fs = require('fs');
const {
  STORAGE_ROOT,
  USER_IMAGES_DIR,
  SUTRA_THUMBS_DIR,
  SUTRA_AUDIO_DIR,
  DHARMA_THUMBS_DIR,
  DHARMA_AUDIO_DIR,
} = require('./config/storage');

const app = express();

// ensure storage paths exist (use /tmp on serverless)
const ensureDir = (dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (err) {
    console.warn(`Storage directory unavailable: ${dir}`, err.message);
  }
};
ensureDir(USER_IMAGES_DIR);
ensureDir(SUTRA_THUMBS_DIR);
ensureDir(SUTRA_AUDIO_DIR);
ensureDir(DHARMA_THUMBS_DIR);
ensureDir(DHARMA_AUDIO_DIR);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/storage', express.static(STORAGE_ROOT));

app.use('/api', routes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(apiSpec));
app.get('/api/openapi.json', (req, res) => res.json(apiSpec));

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

module.exports = app;
