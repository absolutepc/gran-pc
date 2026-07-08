const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { getDb } = require('./database');

const BCRYPT_ROUNDS = 12;

function createUserId() {
  return `u_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

function findUserByEmail(email) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(normalizeEmail(email));
}

function findUserById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM users WHERE id = ? AND is_active = 1').get(id);
}

function emailExists(email) {
  const db = getDb();
  const row = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizeEmail(email));
  return Boolean(row);
}

function createUser({ name, email, password, role = 'user' }) {
  const db = getDb();
  const normalizedEmail = normalizeEmail(email);
  const trimmedName = String(name || '').trim();

  if (!trimmedName) throw new Error('NAME_REQUIRED');
  if (!normalizedEmail) throw new Error('EMAIL_REQUIRED');
  if (!password || String(password).length < 6) throw new Error('PASSWORD_TOO_SHORT');
  if (emailExists(normalizedEmail)) throw new Error('EMAIL_EXISTS');

  const id = createUserId();
  const passwordHash = bcrypt.hashSync(String(password), BCRYPT_ROUNDS);

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, trimmedName, normalizedEmail, passwordHash, role);

  return findUserById(id);
}

function verifyUserPassword(user, password) {
  if (!user) return false;
  return bcrypt.compareSync(String(password), user.password_hash);
}

function updateUserName(id, name) {
  const db = getDb();
  const trimmedName = String(name || '').trim();
  if (!trimmedName) throw new Error('NAME_REQUIRED');

  db.prepare(`
    UPDATE users
    SET name = ?, updated_at = datetime('now')
    WHERE id = ? AND is_active = 1
  `).run(trimmedName, id);

  return findUserById(id);
}

function listUsers(limit = 100) {
  const db = getDb();
  return db.prepare(`
    SELECT id, name, email, role, created_at, updated_at
    FROM users
    WHERE is_active = 1
    ORDER BY created_at DESC
    LIMIT ?
  `).all(limit);
}

module.exports = {
  createUserId,
  normalizeEmail,
  toPublicUser,
  findUserByEmail,
  findUserById,
  emailExists,
  createUser,
  verifyUserPassword,
  updateUserName,
  listUsers,
};
