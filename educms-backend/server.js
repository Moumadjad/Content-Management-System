const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await testConnection();

  app.listen(PORT, () => {
    logger.info(`EduCMS API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

start();
