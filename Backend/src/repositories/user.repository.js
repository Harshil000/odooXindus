const { pool } = require('../config/database');
const {
  INSERT_USER_QUERY,
  FIND_USER_BY_EMAIL_QUERY,
  FIND_LOGIN_USER_BY_EMAIL_QUERY,
  FIND_USER_BY_ID_QUERY,
  UPDATE_USER_PROFILE_QUERY,
  UPDATE_USER_PROFILE_WITH_PASSWORD_QUERY,
  UPDATE_USER_PASSWORD_QUERY,
} = require('../queries/user.queries');

async function findUserByEmail(email) {
  const result = await pool.query(FIND_USER_BY_EMAIL_QUERY, [email]);
  return result.rows[0] || null;
}

async function createUser({ userId, name, email, password, role }) {
  const values = [userId, name, email, password, role || null];
  const result = await pool.query(INSERT_USER_QUERY, values);
  return result.rows[0];
}

async function findLoginUserByEmail(email) {
  const result = await pool.query(FIND_LOGIN_USER_BY_EMAIL_QUERY, [email]);
  return result.rows[0] || null;
}

async function findUserById(userId) {
  const result = await pool.query(FIND_USER_BY_ID_QUERY, [userId]);
  return result.rows[0] || null;
}

async function updateUserProfile({ userId, name, email, role, password }) {
  const result = password
    ? await pool.query(UPDATE_USER_PROFILE_WITH_PASSWORD_QUERY, [userId, name, email, role, password])
    : await pool.query(UPDATE_USER_PROFILE_QUERY, [userId, name, email, role]);
  return result.rows[0] || null;
}

async function updateUserPassword(userId, password) {
  const result = await pool.query(UPDATE_USER_PASSWORD_QUERY, [userId, password]);
  return result.rows[0] || null;
}

module.exports = {
  findUserByEmail,
  createUser,
  findLoginUserByEmail,
  findUserById,
  updateUserProfile,
  updateUserPassword,
};
