const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

let dbInstance = null;

function resolveDbPath() {
  const configured = process.env.DB_PATH || 'data/pcmarket.db';
  return path.isAbsolute(configured)
    ? configured
    : path.join(__dirname, '../..', configured);
}

function getDb() {
  if (dbInstance) return dbInstance;

  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  dbInstance = new Database(dbPath);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  const schemaPath = path.join(__dirname, 'schema.sql');
  dbInstance.exec(fs.readFileSync(schemaPath, 'utf8'));

  return dbInstance;
}

function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = { getDb, closeDb, resolveDbPath };
