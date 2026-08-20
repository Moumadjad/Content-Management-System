const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

// Idempotent: only applies schema.sql if it hasn't been applied yet, so it's
// safe to call on every server boot (needed on hosts without a separate
// pre-deploy step, e.g. Render's free tier).
const migrate = async () => {
  const { rows } = await pool.query("SELECT to_regclass('public.users') AS users_table");

  if (rows[0].users_table) {
    logger.info('Schema already applied, skipping migration');
    return;
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  logger.info('Applying schema.sql');
  await pool.query(sql);
  logger.info('Migration completed successfully');
};

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Migration failed', { message: error.message });
      process.exit(1);
    })
    .finally(() => pool.end());
}

module.exports = { migrate };
