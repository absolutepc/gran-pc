const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { getDb, closeDb } = require('./database');

function loadEnv() {
  const envPath = path.join(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  });
}

function seedAdmin(db = getDb()) {
  const email = (process.env.ADMIN_EMAIL || 'admin@pcmarket.ru').toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return;

  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Администратор';
  const passwordHash = bcrypt.hashSync(password, 12);

  db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (?, ?, ?, ?, 'admin')
  `).run(`admin-${Date.now()}`, name, email, passwordHash);

  console.log(`Администратор создан: ${email}`);
}

function initDatabase() {
  loadEnv();
  const db = getDb();
  seedAdmin(db);
  closeDb();
  console.log('База данных инициализирована.');
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase, seedAdmin };
