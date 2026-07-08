const jwt = require('jsonwebtoken');
const { findUserById, toPublicUser } = require('../db/users');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'change-me-to-a-long-random-string') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return 'pcmarket-dev-secret';
  }
  return secret;
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    getJwtSecret(),
    { expiresIn: '7d' },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Требуется авторизация' });
  }

  try {
    const payload = verifyAccessToken(token);
    const user = findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Пользователь не найден' });
    }
    req.user = toPublicUser(user);
    req.auth = payload;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Недействительный или просроченный токен' });
  }
}

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Доступ только для администратора' });
    }
    return next();
  });
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  authRequired,
  adminRequired,
};
