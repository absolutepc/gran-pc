const express = require('express');
const {
  createUser,
  findUserByEmail,
  toPublicUser,
  verifyUserPassword,
  updateUserName,
} = require('../db/users');
const { signAccessToken, authRequired } = require('../middleware/auth');

const router = express.Router();

function authSuccess(res, user) {
  const publicUser = toPublicUser(user);
  const token = signAccessToken(user);
  return res.json({
    success: true,
    user: publicUser,
    token,
  });
}

router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const user = createUser({ name, email, password, role: 'user' });
    return authSuccess(res, user);
  } catch (error) {
    const map = {
      NAME_REQUIRED: 'Укажите имя',
      EMAIL_REQUIRED: 'Укажите email',
      EMAIL_EXISTS: 'Email уже зарегистрирован',
      PASSWORD_TOO_SHORT: 'Пароль должен быть не короче 6 символов',
    };
    const message = map[error.message] || 'Не удалось зарегистрировать пользователя';
    const status = error.message === 'EMAIL_EXISTS' ? 409 : 400;
    return res.status(status).json({ success: false, message });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = findUserByEmail(email);

  if (!user || !verifyUserPassword(user, password)) {
    return res.status(401).json({ success: false, message: 'Неверный email или пароль' });
  }

  return authSuccess(res, user);
});

router.get('/me', authRequired, (req, res) => {
  res.json({ success: true, user: req.user });
});

router.patch('/profile', authRequired, (req, res) => {
  try {
    const updated = updateUserName(req.user.id, req.body?.name);
    return res.json({ success: true, user: toPublicUser(updated) });
  } catch (error) {
    const message = error.message === 'NAME_REQUIRED' ? 'Укажите имя' : 'Не удалось обновить профиль';
    return res.status(400).json({ success: false, message });
  }
});

module.exports = router;
