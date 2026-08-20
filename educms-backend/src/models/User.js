const { query } = require('../config/database');

const PUBLIC_FIELDS = `
  user_id, username, email, first_name, last_name, role, bio, avatar,
  created_at, updated_at, last_login, is_active, email_verified
`;

const create = async ({ username, email, passwordHash, firstName, lastName, role = 'subscriber' }) => {
  const result = await query(
    `INSERT INTO users (username, email, password_hash, first_name, last_name, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${PUBLIC_FIELDS}`,
    [username, email, passwordHash, firstName || null, lastName || null, role]
  );
  return result.rows[0];
};

const findByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

const findByUsername = async (username) => {
  const result = await query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
};

const findById = async (userId) => {
  const result = await query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE user_id = $1`, [userId]);
  return result.rows[0] || null;
};

const updateLastLogin = async (userId) => {
  await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [userId]);
};

module.exports = {
  create,
  findByEmail,
  findByUsername,
  findById,
  updateLastLogin,
};
