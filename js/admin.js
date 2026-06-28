let adminSection = 'dashboard';

const PRODUCT_FILTER_FIELDS = [
  'badge', 'socket', 'memoryType', 'pcie', 'atx', 'ram', 'liquid',
  'psutype', 'caseff', 'inch', 'matrix', 'hertz', 'quality', 'wired',
];

function pickProductFilterFields(data) {
  const fields = {};
  PRODUCT_FILTER_FIELDS.forEach(key => {
    fields[key] = data[key] || undefined;
  });
  return fields;
}

function parseProductColors(raw) {
  if (!raw || !raw.trim()) return undefined;
  const colors = raw.trim().split('\n').map(line => {
    const parts = line.split('|').map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) return null;
    const [name, hex, ...imgs] = parts;
    if (!name || !hex) return null;
    const images = imgs.length ? imgs : undefined;
    return {
      name,
      hex,
      img: imgs[0] || undefined,
      ...(images ? { images } : {}),
    };
  }).filter(Boolean);
  return colors.length ? colors : undefined;
}

function formatProductColors(colors) {
  if (!colors?.length) return '';
  return colors.map(c => {
    const imgs = c.images?.length ? c.images : (c.img ? [c.img] : []);
    return [c.name, c.hex, ...imgs].join('|');
  }).join('\n');
}

function parseProductImages(raw) {
  if (!raw || !raw.trim()) return undefined;
  const images = raw.trim().split('\n').map(line => line.trim()).filter(Boolean);
  return images.length ? images : undefined;
}

function formatProductImages(images) {
  if (!images?.length) return '';
  return images.join('\n');
}

function fillProductFilterFields(form, product) {
  PRODUCT_FILTER_FIELDS.forEach(key => {
    if (form[key]) form[key].value = product[key] || '';
  });
}

function initAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    document.getElementById('adminGate').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    bindAdminLogin();
    return;
  }
  document.getElementById('adminGate').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'grid';
  renderAdminSection('dashboard');
  bindAdminNav();
}

function bindAdminLogin() {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    const result = loginUser(email, password);
    if (result.success && result.isAdmin) {
      showToast('Добро пожаловать, администратор!', 'success');
      initAdmin();
    } else {
      showToast('Только для администраторов. admin@pcmarket.ru / admin123', 'error');
    }
  });
}

function bindAdminNav() {
  document.querySelectorAll('.admin-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      adminSection = btn.dataset.section;
      document.querySelectorAll('.admin-nav button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAdminSection(adminSection);
    });
  });
}

function renderAdminSection(section) {
  const main = document.getElementById('adminContent');
  if (!main) return;

  switch (section) {
    case 'dashboard': main.innerHTML = renderDashboard(); bindDashboard(); break;
    case 'products': main.innerHTML = renderProductsAdmin(); bindProductAdmin(); break;
    case 'ready-pcs': main.innerHTML = renderReadyPCsAdmin(); bindReadyPCAdmin(); break;
    case 'orders': main.innerHTML = renderOrdersAdmin(); bindOrdersAdmin(); break;
    case 'users': main.innerHTML = renderUsersAdmin(); break;
    case 'settings': main.innerHTML = renderSettingsAdmin(); break;
  }
}

function renderDashboard() {
  const products = getProducts();
  const orders = getOrders();
  const users = getUsers();
  const revenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0);

  return `
    <div class="admin-header">
      <h1>Панель управления</h1>
      <button type="button" class="btn btn-secondary btn-sm" id="resetCatalogBtn">Сбросить каталог к data.js</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Общая выручка</div>
        <div class="stat-value">${formatPrice(revenue)}</div>
        <div class="stat-change positive">+12.5% за месяц</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Заказы</div>
        <div class="stat-value">${orders.length}</div>
        <div class="stat-change positive">+8 сегодня</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Товары</div>
        <div class="stat-value">${products.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Клиенты</div>
        <div class="stat-value">${users.length}</div>
        <div class="stat-change positive">+3 за неделю</div>
      </div>
    </div>
    <h2 style="margin-bottom:16px;font-size:1.2rem">Последние заказы</h2>
    ${renderOrdersTable(orders.slice(0, 5))}
  `;
}

function bindDashboard() {
  document.getElementById('resetCatalogBtn')?.addEventListener('click', () => {
    if (!confirm('Сбросить каталог к значениям из data.js? Изменения товаров и сборок в админке будут заменены.')) return;
    resetCatalogToDefaults();
    renderAdminSection('dashboard');
  });
}

function renderProductsAdmin() {
  const products = getProducts();
  return `
    <div class="admin-header">
      <h1>Товары</h1>
      <button class="btn btn-primary btn-sm" id="addProductBtn">+ Добавить товар</button>
    </div>
    <div id="productForm" style="display:none;margin-bottom:24px">
      <div class="account-content">
        <h2 id="productFormTitle">Добавить товар</h2>
        <form id="productEditForm">
          <input type="hidden" name="editId" value="">
          <div class="admin-form-grid">
            <div class="form-group"><label>Название</label><input name="name" required></div>
            <div class="form-group"><label>Категория</label>
              <select name="category" required>
                ${Object.entries(CATEGORY_LABELS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>Цена (₽)</label><input name="price" type="number" required></div>
            <div class="form-group"><label>На складе</label><input name="stock" type="number" required></div>
            <div class="form-group"><label>Изображение (URL или путь)</label><input name="img" value="img/default.svg"></div>
            <div class="form-group"><label>Метка</label>
              <select name="badge"><option value="">Нет</option><option value="new">Новинка</option><option value="sale">Скидка</option></select>
            </div>
            <div class="form-group"><label>Сокет</label>
              <select name="socket">
                <option value="">—</option>
                ${FILTER_SOCKETS.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>Тип памяти</label>
              <select name="memoryType">
                <option value="">—</option>
                ${FILTER_MEMORY_TYPES.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>PCI-E</label>
              <select name="pcie">
                <option value="">—</option>
                ${FILTER_PCIE.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>ATX</label>
              <select name="atx">
                <option value="">—</option>
                ${FILTER_ATX.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>Память</label>
              <select name="ram">
                <option value="">—</option>
                ${FILTER_RAM.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>СЖО</label>
              <select name="liquid">
                <option value="">—</option>
                ${FILTER_LIQUID.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>PSU-TYPE</label>
              <select name="psutype">
                <option value="">—</option>
                ${FILTER_PSUTYPE.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>CASE-FF</label>
              <select name="caseff">
                <option value="">—</option>
                ${FILTER_CASEFF.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>INCH</label>
              <select name="inch">
                <option value="">—</option>
                ${FILTER_INCH.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>Матрица</label>
              <select name="matrix">
                <option value="">—</option>
                ${FILTER_MATRIX.map(s => `<option value="${s}">${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>Герцовка</label>
              <select name="hertz">
                <option value="">—</option>
                ${FILTER_HERTZ.map(m => `<option value="${m}">${m}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>Качество</label>
              <select name="quality">
                <option value="">—</option>
                ${FILTER_QUALITY.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>Тип-Соединения</label>
              <select name="wired">
                <option value="">—</option>
                ${FILTER_WIRED.map(p => `<option value="${p}">${p}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group"><label>Описание</label><textarea name="description" rows="2"></textarea></div>
          <div class="form-group"><label>Полное описание (страница «Подробнее»)</label><textarea name="fullDescription" rows="4" placeholder="Расширенное описание для страницы товара"></textarea></div>
          <div class="form-group"><label>Цветовые варианты</label><textarea name="colors" rows="4" placeholder="По одному цвету на строку: Название|#hex|фото1|фото2|...&#10;Чёрный|#1a1a1a|img/case/D400-B.png|img/case/D400-B-2.png&#10;Белый|#f0f0f0|img/case/D400-W.png"></textarea></div>
          <div class="form-group"><label>Галерея изображений</label><textarea name="images" rows="4" placeholder="По одному пути на строку&#10;img/components/case/D400-B.png&#10;img/components/case/D400-W.png"></textarea></div>
          <div style="display:flex;gap:8px;margin-top:16px">
            <button type="submit" class="btn btn-primary btn-sm">Сохранить</button>
            <button type="button" class="btn btn-secondary btn-sm" id="cancelProductForm">Отмена</button>
          </div>
        </form>
      </div>
    </div>
    <table class="admin-table">
      <thead><tr><th>Товар</th><th>Категория</th><th>Цена</th><th>На складе</th><th>Действия</th></tr></thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td><img class="admin-product-thumb" src="${getProductImg(p)}" alt=""> ${p.name}</td>
            <td>${CATEGORY_LABELS[p.category] || p.category}</td>
            <td>${formatPrice(p.price)}</td>
            <td>${p.stock}</td>
            <td>
              <button class="btn btn-secondary btn-sm edit-product" data-id="${p.id}">Изменить</button>
              <button class="btn btn-danger btn-sm delete-product" data-id="${p.id}">Удалить</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function bindProductAdmin() {
  const form = document.getElementById('productEditForm');
  const formWrap = document.getElementById('productForm');
  const addBtn = document.getElementById('addProductBtn');
  const cancelBtn = document.getElementById('cancelProductForm');

  if (addBtn) addBtn.addEventListener('click', () => {
    formWrap.style.display = 'block';
    form.reset();
    form.editId.value = '';
    form.img.value = 'img/default.svg';
    document.getElementById('productFormTitle').textContent = 'Добавить товар';
  });

  if (cancelBtn) cancelBtn.addEventListener('click', () => { formWrap.style.display = 'none'; });

  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const products = getProducts();
    const data = Object.fromEntries(new FormData(form));
    const filterFields = pickProductFilterFields(data);
    const colors = parseProductColors(data.colors);
    const images = parseProductImages(data.images);
    const productFields = {
      name: data.name,
      category: data.category,
      price: +data.price,
      stock: +data.stock,
      img: data.img || DEFAULT_IMG,
      description: data.description,
      fullDescription: data.fullDescription || undefined,
      ...(colors ? { colors } : {}),
      ...(images ? { images } : {}),
      ...filterFields,
    };
    if (data.editId) {
      const idx = products.findIndex(p => p.id === data.editId);
      if (idx >= 0) {
        products[idx] = { ...products[idx], ...productFields };
      }
    } else {
      products.push({
        id: 'p' + Date.now(),
        ...productFields,
        specs: {},
      });
    }
    saveProducts(products);
    showToast('Товар сохранён', 'success');
    renderAdminSection('products');
    bindProductAdmin();
  });

  document.querySelectorAll('.edit-product').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = getProducts().find(p => p.id === btn.dataset.id);
      if (!product) return;
      formWrap.style.display = 'block';
      form.editId.value = product.id;
      form.name.value = product.name;
      form.category.value = product.category;
      form.price.value = product.price;
      form.stock.value = product.stock;
      form.img.value = getProductImg(product);
      fillProductFilterFields(form, product);
      form.description.value = product.description || '';
      form.fullDescription.value = product.fullDescription || '';
      form.colors.value = formatProductColors(product.colors);
      form.images.value = formatProductImages(product.images);
      document.getElementById('productFormTitle').textContent = 'Редактировать товар';
    });
  });

  document.querySelectorAll('.delete-product').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Удалить этот товар?')) {
        saveProducts(getProducts().filter(p => p.id !== btn.dataset.id));
        showToast('Товар удалён', 'success');
        renderAdminSection('products');
        bindProductAdmin();
      }
    });
  });
}

function renderOrdersTable(orders) {
  if (orders.length === 0) return '<p style="color:var(--text-secondary)">Заказов пока нет.</p>';
  return `
    <table class="admin-table">
      <thead><tr><th>№ заказа</th><th>Клиент</th><th>Сумма</th><th>Статус</th><th>Дата</th><th>Действия</th></tr></thead>
      <tbody>
        ${orders.map(o => `
          <tr>
            <td>${o.id}</td>
            <td>${o.userName}</td>
            <td>${formatPrice(o.total)}</td>
            <td><span class="status-badge ${o.status}">${STATUS_LABELS[o.status] || o.status}</span></td>
            <td>${new Date(o.createdAt).toLocaleDateString('ru-RU')}</td>
            <td>
              ${o.status === 'pending' ? `
                <button class="btn btn-primary btn-sm complete-order" data-id="${o.id}">Выполнить</button>
                <button class="btn btn-danger btn-sm cancel-order" data-id="${o.id}">Отменить</button>
              ` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderOrdersAdmin() {
  return `
    <div class="admin-header"><h1>Заказы</h1></div>
    ${renderOrdersTable(getOrders())}
  `;
}

function bindOrdersAdmin() {
  document.querySelectorAll('.complete-order').forEach(btn => {
    btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'completed'));
  });
  document.querySelectorAll('.cancel-order').forEach(btn => {
    btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'cancelled'));
  });
}

function updateOrderStatus(id, status) {
  const orders = getOrders();
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    saveOrders(orders);
    showToast(`Заказ: ${STATUS_LABELS[status] || status}`, 'success');
    renderAdminSection('orders');
    bindOrdersAdmin();
  }
}

function renderUsersAdmin() {
  const users = getUsers();
  return `
    <div class="admin-header"><h1>Клиенты</h1></div>
    <table class="admin-table">
      <thead><tr><th>Имя</th><th>Email</th><th>Дата регистрации</th></tr></thead>
      <tbody>
        ${users.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:var(--text-secondary)">Пока нет зарегистрированных пользователей</td></tr>' :
          users.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td>${new Date(u.createdAt).toLocaleDateString('ru-RU')}</td>
            </tr>
          `).join('')}
      </tbody>
    </table>
  `;
}

function renderReadyPCsAdmin() {
  const pcs = getReadyPCs();
  return `
    <div class="admin-header">
      <h1>Готовые ПК</h1>
      <button class="btn btn-primary btn-sm" id="addReadyPCBtn">+ Добавить сборку</button>
    </div>
    <div id="readyPCForm" style="display:none;margin-bottom:24px">
      <div class="account-content">
        <h2 id="readyPCFormTitle">Добавить сборку</h2>
        <form id="readyPCEditForm">
          <input type="hidden" name="editId" value="">
          <div class="admin-form-grid">
            <div class="form-group"><label>Название</label><input name="name" required></div>
            <div class="form-group"><label>Цена (₽)</label><input name="price" type="number" min="0" required></div>
            <div class="form-group"><label>Метка</label>
              <select name="badge">
                <option value="">Нет</option>
                <option value="new">Новинка</option>
                <option value="sale">Скидка</option>
              </select>
            </div>
            <div class="form-group"><label>Изображение (URL или путь)</label><input name="img" value="img/ready/pc.svg" required></div>
          </div>
          <div class="form-group"><label>Описание (краткое)</label><textarea name="description" rows="2"></textarea></div>
          <div class="form-group"><label>Полное описание</label><textarea name="fullDescription" rows="4" placeholder="Текст на странице «Подробнее»"></textarea></div>
          <div class="form-group"><label>Цветовые варианты</label><textarea name="colors" rows="4" placeholder="По одному цвету на строку: Название|#hex|фото1|фото2|...&#10;Чёрный|#1a1a1a|img/case/D400-B.png|img/case/D400-B-2.png&#10;Белый|#f0f0f0|img/case/D400-W.png"></textarea></div>
          <div class="form-group"><label>Галерея изображений</label><textarea name="images" rows="4" placeholder="По одному пути на строку&#10;img/components/case/D400-B.png&#10;img/components/case/D400-W.png"></textarea></div>
          <div class="form-group">
            <label>Комплектация (каждый пункт с новой строки)</label>
            <textarea name="specs" rows="5" placeholder="RTX 4070 Super&#10;Ryzen 7 7700&#10;32 ГБ DDR5"></textarea>
          </div>
          <h3 style="margin:16px 0 12px;font-size:1rem">Производительность (%)</h3>
          <div class="admin-form-grid">
            <div class="form-group"><label>${PERFORMANCE_LABELS.gaming}</label><input name="perf_gaming" type="number" min="0" max="100" value="50"></div>
            <div class="form-group"><label>${PERFORMANCE_LABELS.work}</label><input name="perf_work" type="number" min="0" max="100" value="50"></div>
            <div class="form-group"><label>${PERFORMANCE_LABELS.streaming}</label><input name="perf_streaming" type="number" min="0" max="100" value="50"></div>
          </div>
          <div class="form-group">
            <label>Предпросмотр фото</label>
            <div class="admin-img-preview">
              <img id="readyPCImgPreview" src="${DEFAULT_IMG}" alt="Предпросмотр">
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:16px">
            <button type="submit" class="btn btn-primary btn-sm">Сохранить</button>
            <button type="button" class="btn btn-secondary btn-sm" id="cancelReadyPCForm">Отмена</button>
          </div>
        </form>
      </div>
    </div>
    <table class="admin-table">
      <thead><tr><th>Сборка</th><th>Цена</th><th>Метка</th><th>Действия</th></tr></thead>
      <tbody>
        ${pcs.length === 0 ? '<tr><td colspan="4" style="text-align:center;color:var(--text-secondary)">Сборок пока нет</td></tr>' :
          pcs.map(pc => `
            <tr>
              <td><img class="admin-product-thumb" src="${getProductImg(pc)}" alt=""> ${pc.name}</td>
              <td>${formatPrice(pc.price)}</td>
              <td>${pc.badge ? (BADGE_LABELS[pc.badge] || pc.badge) : '—'}</td>
              <td>
                <a href="ready-pc.html?id=${pc.id}" class="btn btn-secondary btn-sm" target="_blank">Просмотр</a>
                <button class="btn btn-secondary btn-sm edit-ready-pc" data-id="${pc.id}">Изменить</button>
                <button class="btn btn-danger btn-sm delete-ready-pc" data-id="${pc.id}">Удалить</button>
              </td>
            </tr>
          `).join('')}
      </tbody>
    </table>
  `;
}

function parseReadyPCSpecs(text) {
  return (text || '').split('\n').map(s => s.trim()).filter(Boolean);
}

function clampPerf(value) {
  return Math.min(100, Math.max(0, +value || 0));
}

function fillReadyPCForm(form, pc) {
  form.editId.value = pc?.id || '';
  form.name.value = pc?.name || '';
  form.price.value = pc?.price ?? '';
  form.badge.value = pc?.badge || '';
  form.img.value = pc ? getProductImg(pc) : 'img/ready/pc.svg';
  form.description.value = pc?.description || '';
  form.fullDescription.value = pc?.fullDescription || '';
  form.colors.value = formatProductColors(pc?.colors);
  form.images.value = formatProductImages(pc?.images);
  form.specs.value = (pc?.specs || []).join('\n');
  form.perf_gaming.value = pc?.performance?.gaming ?? 50;
  form.perf_work.value = pc?.performance?.work ?? 50;
  form.perf_streaming.value = pc?.performance?.streaming ?? 50;
}

function buildReadyPCFromForm(data, existing) {
  const colors = parseProductColors(data.colors);
  const images = parseProductImages(data.images);
  const img = data.img.trim() || 'img/ready/pc.svg';
  return {
    name: data.name.trim(),
    price: +data.price,
    img,
    description: data.description.trim(),
    fullDescription: (data.fullDescription || data.description || '').trim(),
    images: images || existing?.images || [img],
    ...(colors ? { colors } : {}),
    components: existing?.components?.length ? existing.components : (DEFAULT_READY_PCS.find(d => d.id === existing?.id)?.components || []),
    badge: data.badge || undefined,
    specs: parseReadyPCSpecs(data.specs),
    performance: {
      gaming: clampPerf(data.perf_gaming),
      work: clampPerf(data.perf_work),
      streaming: clampPerf(data.perf_streaming),
    },
  };
}

function bindReadyPCAdmin() {
  const form = document.getElementById('readyPCEditForm');
  const formWrap = document.getElementById('readyPCForm');
  const addBtn = document.getElementById('addReadyPCBtn');
  const cancelBtn = document.getElementById('cancelReadyPCForm');
  const preview = document.getElementById('readyPCImgPreview');
  const titleEl = document.getElementById('readyPCFormTitle');

  const updatePreview = (src) => {
    if (preview) preview.src = src || DEFAULT_IMG;
  };

  if (form?.img) {
    form.img.addEventListener('input', () => updatePreview(form.img.value.trim()));
  }

  if (addBtn) addBtn.addEventListener('click', () => {
    formWrap.style.display = 'block';
    form.reset();
    form.editId.value = '';
    form.img.value = 'img/ready/pc.svg';
    form.perf_gaming.value = 50;
    form.perf_work.value = 50;
    form.perf_streaming.value = 50;
    updatePreview('img/ready/pc.svg');
    if (titleEl) titleEl.textContent = 'Добавить сборку';
    formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  if (cancelBtn) cancelBtn.addEventListener('click', () => { formWrap.style.display = 'none'; });

  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pcs = getReadyPCs();
    const data = Object.fromEntries(new FormData(form));
    const existing = data.editId ? pcs.find(p => p.id === data.editId) : null;
    const payload = buildReadyPCFromForm(data, existing);

    if (data.editId) {
      const idx = pcs.findIndex(p => p.id === data.editId);
      if (idx >= 0) pcs[idx] = { ...pcs[idx], ...payload };
    } else {
      pcs.push({ id: 'rpc' + Date.now(), ...payload });
    }

    saveReadyPCs(pcs);
    showToast('Сборка сохранена', 'success');
    renderAdminSection('ready-pcs');
    bindReadyPCAdmin();
  });

  document.querySelectorAll('.edit-ready-pc').forEach(btn => {
    btn.addEventListener('click', () => {
      const pc = getReadyPCs().find(p => p.id === btn.dataset.id);
      if (!pc) return;
      formWrap.style.display = 'block';
      fillReadyPCForm(form, pc);
      updatePreview(getProductImg(pc));
      if (titleEl) titleEl.textContent = `Редактировать: ${pc.name}`;
      formWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.querySelectorAll('.delete-ready-pc').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Удалить эту сборку?')) return;
      saveReadyPCs(getReadyPCs().filter(p => p.id !== btn.dataset.id));
      showToast('Сборка удалена', 'success');
      renderAdminSection('ready-pcs');
      bindReadyPCAdmin();
    });
  });
}

function renderSettingsAdmin() {
  return `
    <div class="admin-header"><h1>Настройки</h1></div>
    <div class="account-content">
      <h2>Информация о магазине</h2>
      <div class="admin-form-grid">
        <div class="form-group"><label>Название</label><input value="PC Market"></div>
        <div class="form-group"><label>Телефон</label><input value="+7 (495) 123-45-67"></div>
        <div class="form-group"><label>Email</label><input value="info@pcmarket.ru"></div>
        <div class="form-group"><label>Адрес</label><input value="Москва, Технопарк 42"></div>
      </div>
      <button class="btn btn-primary" style="margin-top:16px" onclick="showToast('Настройки сохранены','success')">Сохранить</button>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('adminPanel') || document.getElementById('adminGate')) {
    initAdmin();
  }
});
