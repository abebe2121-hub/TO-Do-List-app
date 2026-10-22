const db = require("../config/db");

/**
 * Find a user by email address.
 * Returns the user object or null if not found.
 */
async function findUserByEmail(email) {
  const sql = `
    SELECT
      id,
      full_name AS name,
      email,
      password,
      created_at,
      updated_at
    FROM users
    WHERE email = ?
    LIMIT 1
  `;

  const [rows] = await db.promise().execute(sql, [email]);

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Find a user by ID.
 * Returns the user object or null if not found.
 */
async function findUserById(id) {
  const sql = `
    SELECT
      id,
      full_name AS name,
      email,
      password,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await db.promise().execute(sql, [id]);

  return rows.length > 0 ? rows[0] : null;
}

/**
 * Create a user using a hashed password.
 * Returns the newly created user's ID.
 */
async function createUser(name, email, hashedPassword) {
  const sql = `
    INSERT INTO users (full_name, email, password)
    VALUES (?, ?, ?)
  `;

  const [result] = await db
    .promise()
    .execute(sql, [name, email, hashedPassword]);

  return result.insertId;
}

/**
 * Update a user's password hash.
 * Returns true if a row was changed, otherwise false.
 */
async function updateUserPassword(id, hashedPassword) {
  const sql = `
    UPDATE users
    SET password = ?
    WHERE id = ?
  `;

  const [result] = await db.promise().execute(sql, [hashedPassword, id]);

  return result.affectedRows > 0;
}

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserPassword,
};
