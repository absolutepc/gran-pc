function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function normalizeColorName(colorName) {
  return colorName || '';
}

function cartItemsMatch(a, b) {
  return a.id === b.id
    && a.type === b.type
    && normalizeColorName(a.colorName) === normalizeColorName(b.colorName);
}

function findCartItem(cart, id, type, colorName = '') {
  const normalized = normalizeColorName(colorName);
  return cart.find(c => c.id === id && c.type === type && normalizeColorName(c.colorName) === normalized);
}

function getActiveItemColor(scope) {
  const activeBtn = (scope || document).querySelector(
    '.product-color-picker .color-btn.active, .pc-color-picker .color-btn.active'
  );
  if (!activeBtn) return null;
  return {
    colorName: activeBtn.dataset.name,
    colorHex: activeBtn.style.getPropertyValue('--swatch').trim(),
    img: activeBtn.dataset.img,
  };
}

function resolveItemColor(item, scope) {
  const selected = getActiveItemColor(scope);
  if (selected) return selected;
  const defaultColor = item.colors?.[0];
  if (defaultColor) {
    return {
      colorName: defaultColor.name,
      colorHex: defaultColor.hex,
      img: defaultColor.img || getProductImg(item),
    };
  }
  return {
    colorName: '',
    colorHex: '',
    img: getProductImg(item),
  };
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(c => cartItemsMatch(c, item));
  if (existing) {
    existing.qty += item.qty || 1;
  } else {
    cart.push({ ...item, qty: item.qty || 1 });
  }
  saveCart(cart);
  const colorLabel = item.colorName ? ` (${item.colorName})` : '';
  showToast(`Товар добавлен в корзину${colorLabel}`, 'success');
}

function removeFromCart(id, type, colorName = '') {
  let cart = getCart();
  const normalized = normalizeColorName(colorName);
  cart = cart.filter(c => !(c.id === id && c.type === type && normalizeColorName(c.colorName) === normalized));
  saveCart(cart);
}

function updateCartQty(id, type, qty, colorName = '') {
  const cart = getCart();
  const item = findCartItem(cart, id, type, colorName);
  if (item) {
    item.qty = Math.max(1, qty);
    saveCart(cart);
  }
}

function clearCart() {
  saveCart([]);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = getCartCount();
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

function getCurrentUser() {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  updateAccountButton();
}

function getUsers() {
  return JSON.parse(localStorage.getItem('pcmarket_users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('pcmarket_users', JSON.stringify(users));
}

function registerUser(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'Email уже зарегистрирован' };
  }
  const user = { id: 'u' + Date.now(), name, email, password, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  setCurrentUser({ id: user.id, name: user.name, email: user.email });
  return { success: true };
}

function loginUser(email, password) {
  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    setCurrentUser({ id: 'admin', name: 'Администратор', email, role: 'admin' });
    return { success: true, isAdmin: true };
  }
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    setCurrentUser({ id: user.id, name: user.name, email: user.email });
    return { success: true };
  }
  return { success: false, message: 'Неверный email или пароль' };
}

function logoutUser() {
  setCurrentUser(null);
}

function updateAccountButton() {
  const btn = document.querySelector('.account-btn-text');
  if (!btn) return;
  const user = getCurrentUser();
  btn.textContent = user ? user.name.split(' ')[0] : 'Аккаунт';
}

function getOrders() {
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function createOrder(cart, user) {
  const orders = getOrders();
  const order = {
    id: 'ORD-' + Date.now(),
    items: [...cart],
    total: getCartTotal(),
    userId: user?.id || 'guest',
    userName: user?.name || 'Гость',
    userEmail: user?.email || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

function searchProducts(query) {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  const products = getProducts();
  const readyPCs = getReadyPCs();
  const all = [
    ...products.map(p => ({ ...p, type: 'product' })),
    ...readyPCs.map(p => ({ ...p, type: 'ready-pc', category: 'ready-pc' })),
  ];
  return all.filter(item =>
    item.name.toLowerCase().includes(q) ||
    (item.description && item.description.toLowerCase().includes(q)) ||
    (item.category && (CATEGORY_LABELS[item.category] || item.category).toLowerCase().includes(q)) ||
    (item.socket && item.socket.toLowerCase().includes(q)) ||
    (item.memoryType && item.memoryType.toLowerCase().includes(q)) ||
    (item.pcie && item.pcie.toLowerCase().includes(q)) ||
    (item.atx && item.atx.toLowerCase().includes(q)) ||
    (item.ram && item.ram.toLowerCase().includes(q)) ||
    (item.liquid && item.liquid.toLowerCase().includes(q)) ||
    (item.psutype && item.psutype.toLowerCase().includes(q)) ||
    (item.caseff && item.caseff.toLowerCase().includes(q)) ||
    (item.inch && item.inch.toLowerCase().includes(q)) ||
    (item.matrix && item.matrix.toLowerCase().includes(q)) ||
    (item.hertz && item.hertz.toLowerCase().includes(q)) ||
    (item.quality && item.quality.toLowerCase().includes(q)) ||
    (item.wired && item.wired.toLowerCase().includes(q)) ||
    (item.specs && (Array.isArray(item.specs) ? item.specs.join(' ') : JSON.stringify(item.specs)).toLowerCase().includes(q))
  );
}

function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function renderProductCard(product, type = 'product') {
  const badgeHtml = product.badge
    ? `<span class="product-badge ${product.badge}">${BADGE_LABELS[product.badge] || product.badge}</span>`
    : '';
  const oldPriceHtml = product.oldPrice
    ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
    : '';
  const categoryLabel = type === 'ready-pc' ? 'Готовый ПК' : (CATEGORY_LABELS[product.category] || product.category);
  const imgSrc = getProductImg(product);
  const transitionImg = getItemTransitionImage(product);
  const attrTags = [
    product.socket && `<span class="product-attr-tag">${product.socket}</span>`,
    product.memoryType && `<span class="product-attr-tag">${product.memoryType}</span>`,
    product.pcie && `<span class="product-attr-tag">${product.pcie}</span>`,
    product.atx && `<span class="product-attr-tag">${product.atx}</span>`,
    product.ram && `<span class="product-attr-tag">${product.ram}</span>`,
    product.liquid && `<span class="product-attr-tag">${product.liquid}</span>`,
    product.psutype && `<span class="product-attr-tag">${product.psutype}</span>`,
    product.caseff && `<span class="product-attr-tag">${product.caseff}</span>`,
    product.inch && `<span class="product-attr-tag">${product.inch}</span>`,
    product.matrix && `<span class="product-attr-tag">${product.matrix}</span>`,
    product.hertz && `<span class="product-attr-tag">${product.hertz}</span>`,
    product.quality && `<span class="product-attr-tag">${product.quality}</span>`,
    product.wired && `<span class="product-attr-tag">${product.wired}</span>`,
  ].filter(Boolean).join('');

  return `
    <div class="product-card" data-id="${product.id}" data-type="${type}">
      <div class="product-image">
        ${badgeHtml}
        ${renderProductImg(imgSrc, product.name)}
      </div>
      <div class="product-info">
        <div class="product-category">${categoryLabel}</div>
        <h3>${product.name}</h3>
        ${attrTags ? `<div class="product-attrs">${attrTags}</div>` : ''}
        <p>${product.description || ''}</p>
        <div class="product-footer">
          <div class="product-price">${formatPrice(product.price)}${oldPriceHtml}</div>
          <div class="product-actions">
            <a href="product.html?id=${product.id}" class="btn btn-secondary btn-sm" data-transition-label="${escapeHtml(product.name)}" data-transition-image="${escapeHtml(transitionImg)}">Подробнее</a>
            <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${product.id}" data-type="${type}">В корзину</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function bindAddToCartButtons(container) {
  (container || document).querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const type = btn.dataset.type;
      let item;
      if (type === 'ready-pc') {
        item = getReadyPCs().find(p => p.id === id);
      } else {
        item = getProducts().find(p => p.id === id);
      }
      if (item) {
        const scope = btn.closest('.pc-detail-page') || btn.closest('.product-card') || container || document;
        const color = resolveItemColor(item, scope);
        addToCart({
          id: item.id,
          name: item.name,
          price: item.price,
          img: color.img,
          colorName: color.colorName,
          colorHex: color.colorHex,
          type: type === 'ready-pc' ? 'ready-pc' : 'product',
          category: type === 'ready-pc' ? 'Готовый ПК' : (CATEGORY_LABELS[item.category] || item.category),
        });
      }
    });
  });
}

function handleSearch(query) {
  if (query.trim()) {
    window.location.href = `search.html?q=${encodeURIComponent(query.trim())}`;
  }
}

function initSearch() {
  const searchInput = document.querySelector('.header-search input');
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch(searchInput.value);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateAccountButton();
  initSearch();
});
