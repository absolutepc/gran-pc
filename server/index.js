const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { getDb, resolveDbPath } = require('./db/database');
const { seedAdmin } = require('./db/init');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = Number(process.env.PORT || 3001);

getDb();
seedAdmin();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'pcmarket-auth', db: resolveDbPath() });
});

app.use('/api/auth', authRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Маршрут не найден' });
});

app.use((err, _req, res, _next) => {
  console.error('PC Market API error:', err);
  res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`PC Market API: http://localhost:${PORT}`);
  console.log(`SQLite database: ${resolveDbPath()}`);
});
