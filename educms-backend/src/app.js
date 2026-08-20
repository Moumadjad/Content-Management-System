const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const { errorResponse } = require('./utils/helpers');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const apiVersion = process.env.API_VERSION || 'v1';

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'EduCMS API is running', env: process.env.NODE_ENV });
});

app.get(`/api/${apiVersion}`, (req, res) => {
  res.json({ success: true, message: `EduCMS API ${apiVersion}` });
});

// TODO: mount feature routes here as they are built, e.g.
// app.use(`/api/${apiVersion}/auth`, require('./routes/auth'));

app.use((req, res) => {
  res.status(404).json(errorResponse('Route not found'));
});

app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(err.status || 500).json(errorResponse(err.message || 'Internal server error'));
});

module.exports = app;
