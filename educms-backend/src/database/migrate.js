const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

const run = async () => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    logger.info('Running migration: schema.sql');
    await pool.query(sql);
    logger.info('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed', { message: error.message });
    process.exit(1);
  } finally {
    await pool.end();
  }
};

run();
