const INSERT_USER_QUERY = `
  INSERT INTO users (user_id, name, email, password, role)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING user_id, name, email, role, created_at;
`;

const FIND_USER_BY_EMAIL_QUERY = `
  SELECT user_id, name, email, role, created_at
  FROM users
  WHERE email = $1
  LIMIT 1;
`;

const FIND_LOGIN_USER_BY_EMAIL_QUERY = `
  SELECT user_id, name, email, password, role, created_at
  FROM users
  WHERE email = $1
  LIMIT 1;
`;

const FIND_USER_BY_ID_QUERY = `
  SELECT user_id, name, email, role, created_at
  FROM users
  WHERE user_id = $1
  LIMIT 1;
`;

const UPDATE_USER_PROFILE_QUERY = `
  UPDATE users
  SET name = $2,
      email = $3,
      role = $4
  WHERE user_id = $1
  RETURNING user_id, name, email, role, created_at;
`;

const UPDATE_USER_PROFILE_WITH_PASSWORD_QUERY = `
  UPDATE users
  SET name = $2,
      email = $3,
      role = $4,
      password = $5
  WHERE user_id = $1
  RETURNING user_id, name, email, role, created_at;
`;

const UPDATE_USER_PASSWORD_QUERY = `
  UPDATE users
  SET password = $2
  WHERE user_id = $1
  RETURNING user_id, name, email, role, created_at;
`;

module.exports = {
  INSERT_USER_QUERY,
  FIND_USER_BY_EMAIL_QUERY,
  FIND_LOGIN_USER_BY_EMAIL_QUERY,
  FIND_USER_BY_ID_QUERY,
  UPDATE_USER_PROFILE_QUERY,
  UPDATE_USER_PROFILE_WITH_PASSWORD_QUERY,
  UPDATE_USER_PASSWORD_QUERY,
};
