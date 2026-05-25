export async function ensureUsersTable(pool) {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(64) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(32) NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`
  );
}

export async function findUserByUsername(pool, username) {
  const [rows] = await pool.query(
    `SELECT id, username, password_hash, role, is_active, created_at
     FROM users
     WHERE username = ?
     LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

export async function findUserById(pool, id) {
  const [rows] = await pool.query(
    `SELECT id, username, password_hash, role, is_active, created_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function listUsers(pool) {
  const [rows] = await pool.query(
    `SELECT id, username, role, is_active, created_at
     FROM users
     ORDER BY username ASC`
  );
  return rows;
}

export async function createUser(pool, { username, passwordHash, role }) {
  const [result] = await pool.query(
    `INSERT INTO users (username, password_hash, role, is_active)
     VALUES (?, ?, ?, 1)`,
    [username, passwordHash, role]
  );
  return result.insertId;
}
