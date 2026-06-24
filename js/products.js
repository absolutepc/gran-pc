function renderProductSpecsTable(product) {
  const rows = [];

  PRODUCT_ATTRIBUTE_FIELDS.forEach(field => {
    if (product[field]) {
      rows.push({ label: ATTRIBUTE_LABELS[field], value: product[field] });
    }
  });

  if (product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)) {
    Object.entries(product.specs).forEach(([key, value]) => {
      rows.push({ label: PRODUCT_SPEC_LABELS[key] || key, value });
    });
  }

  rows.push({ label: 'На складе', value: `${product.stock ?? 0} шт.` });
  rows.push({ label: 'Категория', value: CATEGORY_LABELS[product.category] || product.category });

  if (!rows.length) {
    return '<p class="section-sub">Характеристики будут добавлены позже.</p>';
  }

  return `
    <div class="product-specs-table">
      ${rows.map(row => `
        <div class="product-spec-row">
          <span class="product-spec-label">${row.label}</span>
          <span class="product-spec-value">${row.value}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function getProductGalleryItems(product) {
  const images = product.images || [];
  if (images.length > 1) {
    return images.map(src => ({ src, filter: '', colorName: '' }));
  }

  const colors = product.colors || [];
  if (colors.length > 1) {
    const seen = new Set();
    return colors.map(color => ({
      src: color.img || getProductImg(product),
      filter: color.filter && color.filter !== 'none' ? color.filter : '',
      colorName: color.name || '',
    })).filter(item => {
      const key = `${item.src}|${item.filter}|${item.colorName}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  return [{ src: getProductImg(product), filter: '', colorName: '' }];
}

function renderGalleryThumb(item, productName, index, isActive) {
  const filterStyle = item.filter ? `filter:${item.filter};` : '';
  return `
    <button
      type="button"
      class="pc-gallery-thumb ${isActive ? 'active' : ''}"
      data-src="${item.src}"
      data-filter="${item.filter || ''}"
      data-color-name="${item.colorName || ''}"
      aria-label="Фото ${index + 1}${item.colorName ? `: ${item.colorName}` : ''}"
    >
      <img
        src="${item.src}"
        alt="${productName}"
        style="${filterStyle}"
        loading="lazy"
        onerror="this.src='${DEFAULT_IMG}'"
      >
    </button>
  `;
}

function renderProductColorPicker(product) {
  const colors = product.colors || [];
  if (!colors.length) return '';

  const initial = colors[0];
  return `
    <div class="product-color-picker" data-product-id="${product.id}">
      <span class="color-picker-label">Цвет: <strong id="selectedColorName">${initial.name}</strong></span>
      <div class="color-picker-btns">
        ${colors.map((color, i) => `
          <button
            type="button"
            class="color-btn ${i === 0 ? 'active' : ''}"
            data-index="${i}"
            data-name="${color.name}"
            data-img="${color.img || getProductImg(product)}"
            data-filter="${color.filter || 'none'}"
            style="--swatch: ${color.hex}"
            title="${color.name}"
            aria-label="Цвет: ${color.name}"
          ></button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderProductGallery(product) {
  const items = getProductGalleryItems(product);
  const initial = items[0];
  const initialFilter = initial.filter || product.colors?.[0]?.filter || 'none';
  const filterValue = initialFilter === 'none' ? '' : initialFilter;
  const thumbs = items.length > 1
    ? `<div class="pc-gallery-thumbs">${items.map((item, i) => renderGalleryThumb(item, product.name, i, i === 0)).join('')}</div>`
    : '';

  return `
    <div class="pc-detail-gallery" id="productGallery">
      <div class="product-detail-image-wrap">
        ${product.badge ? `<span class="product-badge ${product.badge}">${BADGE_LABELS[product.badge] || product.badge}</span>` : ''}
        <img
          class="pc-detail-main-img product-detail-main-img"
          id="productDetailMainImg"
          src="${initial.src}"
          alt="${product.name}"
          style="filter: ${filterValue}"
          onerror="this.src='${DEFAULT_IMG}'"
        >
      </div>
      ${thumbs}
      ${renderProductColorPicker(product)}
    </div>
  `;
}

function normalizeGallerySrc(src) {
  try {
    return decodeURI(src || '');
  } catch {
    return src || '';
  }
}

function setProductMainImage(container, src, filter = '', colorName = '') {
  const main = container.querySelector('#productDetailMainImg');
  if (!main) return;
  const normalizedSrc = normalizeGallerySrc(src);
  main.src = normalizedSrc;
  main.style.filter = filter;

  container.querySelectorAll('.pc-gallery-thumb').forEach(btn => {
    const matchesSrc = normalizeGallerySrc(btn.dataset.src) === normalizedSrc;
    const matchesFilter = (btn.dataset.filter || '') === (filter || '');
    btn.classList.toggle('active', matchesSrc && matchesFilter);
  });

  syncColorPickerWithImage(container, normalizedSrc, colorName);
}

function syncColorPickerWithImage(container, src, preferredColorName = '') {
  const picker = container.querySelector('.product-color-picker');
  if (!picker) return;
  const colorNameEl = container.querySelector('#selectedColorName');
  let matched = false;

  picker.querySelectorAll('.color-btn').forEach(btn => {
    const isMatch = preferredColorName
      ? btn.dataset.name === preferredColorName
      : normalizeGallerySrc(btn.dataset.img) === normalizeGallerySrc(src);
    btn.classList.toggle('active', isMatch);
    if (isMatch) {
      matched = true;
      if (colorNameEl) colorNameEl.textContent = btn.dataset.name;
    }
  });

  if (!matched && colorNameEl) {
    const active = picker.querySelector('.color-btn.active');
    if (active) colorNameEl.textContent = active.dataset.name;
  }
}

function bindProductGallery(container) {
  const gallery = container.querySelector('#productGallery');
  if (!gallery) return;

  gallery.addEventListener('click', (event) => {
    const btn = event.target.closest('.pc-gallery-thumb');
    if (!btn || !gallery.contains(btn)) return;

    const src = btn.dataset.src;
    const filter = btn.dataset.filter || '';
    const colorName = btn.dataset.colorName || '';
    setProductMainImage(container, src, filter, colorName);
  });
}

function bindProductColorPicker(container) {
  const picker = container.querySelector('.product-color-picker');
  if (!picker) return;

  picker.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      picker.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const colorNameEl = container.querySelector('#selectedColorName');
      if (colorNameEl) colorNameEl.textContent = btn.dataset.name;

      const filter = btn.dataset.filter === 'none' ? '' : (btn.dataset.filter || '');
      setProductMainImage(container, btn.dataset.img, filter, btn.dataset.name);
    });
  });
}

function renderProductDetail(product) {
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const oldPriceHtml = product.oldPrice
    ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
    : '';
  const attrTags = PRODUCT_ATTRIBUTE_FIELDS
    .filter(f => product[f])
    .map(f => `<span class="product-attr-tag">${product[f]}</span>`)
    .join('');

  return `
    <div class="pc-detail-hero">
      ${renderProductGallery(product)}
      <div class="pc-detail-info">
        <div class="breadcrumbs">
          <a href="index.html">Главная</a> /
          <a href="catalog.html">Каталог</a> /
          <a href="catalog.html?cat=${product.category}">${categoryLabel}</a> /
          <span>${product.name}</span>
        </div>
        <div class="product-category">${categoryLabel}</div>
        <h1>${product.name}</h1>
        <p class="pc-detail-desc">${product.description || ''}</p>
        ${attrTags ? `<div class="product-attrs product-detail-attrs">${attrTags}</div>` : ''}
        <div class="product-price pc-detail-price">${formatPrice(product.price)}${oldPriceHtml}</div>
        <div class="product-stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
          ${product.stock > 0 ? `✓ В наличии: ${product.stock} шт.` : 'Нет в наличии'}
        </div>
        <div class="pc-detail-actions">
          <button class="btn btn-primary btn-lg add-to-cart-btn" data-id="${product.id}" data-type="product">Добавить в корзину</button>
          <a href="catalog.html?cat=${product.category}" class="btn btn-secondary btn-lg">← К каталогу</a>
        </div>
      </div>
    </div>

    <section class="pc-detail-section">
      <h2>Описание</h2>
      <p class="pc-full-desc">${product.fullDescription || product.description || ''}</p>
    </section>

    <section class="pc-detail-section">
      <h2>Характеристики</h2>
      <p class="section-sub">Подробные технические параметры компонента</p>
      ${renderProductSpecsTable(product)}
    </section>
  `;
}

function resolveProductById(id) {
  if (typeof getEnrichedProductById === 'function') return getEnrichedProductById(id);
  if (typeof getProducts === 'function') return getProducts().find(p => p.id === id) || null;
  return null;
}

function initProductDetailPage() {
  const container = document.getElementById('productDetailContent');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = `
      <div class="container pc-detail-page" style="text-align:center">
        <h2>Товар не указан</h2>
        <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
      </div>
    `;
    return;
  }

  const product = resolveProductById(id);
  if (!product) {
    container.innerHTML = `
      <div class="container pc-detail-page" style="text-align:center">
        <h2>Товар не найден</h2>
        <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
      </div>
    `;
    return;
  }

  document.title = `${product.name} — PC Market`;
  container.innerHTML = `<div class="container pc-detail-page">${renderProductDetail(product)}</div>`;
  bindProductGallery(container);
  bindProductColorPicker(container);
  bindAddToCartButtons(container);
  updateCartBadge();
}

