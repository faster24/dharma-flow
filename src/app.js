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

const app = express();

// ensure public storage path exists
const storageDir = path.join(process.cwd(), 'public', 'storage', 'user-images');
fs.mkdirSync(storageDir, { recursive: true });
const sutraThumbDir = path.join(process.cwd(), 'public', 'storage', 'sutra-thumbs');
fs.mkdirSync(sutraThumbDir, { recursive: true });

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.use('/storage', express.static(path.join(process.cwd(), 'public', 'storage')));

app.use('/api', routes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(apiSpec));
app.get('/api/openapi.json', (req, res) => res.json(apiSpec));

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

module.exports = app;
