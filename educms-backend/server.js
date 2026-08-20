const app = require('./src/app');
const { testConnection } = require('./src/config/database');
const { migrate } = require('./src/database/migrate');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

const start = async () => {
  const connected = await testConnection();

  if (connected) {
    try {
      await migrate();
    } catch (error) {
      logger.error('Startup migration failed', { message: error.message });
    }
  }

  app.listen(PORT, () => {
    logger.info(`EduCMS API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

start();
