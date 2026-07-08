const AUTH_TOKEN_KEY = 'pcmarket_auth_token';

function getAuthApiBase() {
  if (window.PCM_AUTH_API_BASE) return String(window.PCM_AUTH_API_BASE).replace(/\/$/, '');
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  return '';
}

function isAuthApiEnabled() {
  return Boolean(getAuthApiBase());
}

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

function setAuthToken(token) {
  if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
  else localStorage.removeItem(AUTH_TOKEN_KEY);
}

async function authApiRequest(path, options = {}) {
  const base = getAuthApiBase();
  if (!base) throw new Error('AUTH_API_DISABLED');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message = data?.message || 'Ошибка сервера авторизации';
    throw new Error(message);
  }

  return data;
}

async function registerUserViaApi(name, email, password) {
  const data = await authApiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setAuthToken(data.token);
  setCurrentUser(data.user);
  return { success: true, user: data.user };
}

async function loginUserViaApi(email, password) {
  const data = await authApiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthToken(data.token);
  setCurrentUser(data.user);
  return {
    success: true,
    isAdmin: data.user?.role === 'admin',
    user: data.user,
  };
}

async function fetchCurrentUserFromApi() {
  if (!getAuthToken()) return null;
  try {
    const data = await authApiRequest('/api/auth/me');
    if (data?.user) setCurrentUser(data.user);
    return data?.user || null;
  } catch {
    setAuthToken(null);
    setCurrentUser(null);
    return null;
  }
}

async function updateProfileViaApi(name) {
  const data = await authApiRequest('/api/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
  setCurrentUser(data.user);
  return data.user;
}

async function checkAuthApiHealth() {
  const base = getAuthApiBase();
  if (!base) return false;
  try {
    const response = await fetch(`${base}/api/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}

async function bootstrapAuthSession() {
  if (!isAuthApiEnabled() || !getAuthToken()) return;
  await fetchCurrentUserFromApi();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { bootstrapAuthSession(); });
} else {
  bootstrapAuthSession();
}
