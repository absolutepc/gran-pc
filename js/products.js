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
  const images = product.images?.length ? product.images : [getProductImg(product)];
  const main = images[0];
  const initialFilter = product.colors?.[0]?.filter || 'none';
  const thumbs = images.length > 1
    ? `<div class="pc-gallery-thumbs">${images.map((src, i) => `
        <button type="button" class="pc-gallery-thumb ${i === 0 ? 'active' : ''}" data-src="${src}" aria-label="Фото ${i + 1}">
          ${renderProductImg(src, product.name)}
        </button>
      `).join('')}</div>`
    : '';

  return `
    <div class="pc-detail-gallery">
      <div class="product-detail-image-wrap">
        ${product.badge ? `<span class="product-badge ${product.badge}">${BADGE_LABELS[product.badge] || product.badge}</span>` : ''}
        <img
          class="pc-detail-main-img product-detail-main-img"
          id="productDetailMainImg"
          src="${main}"
          alt="${product.name}"
          style="filter: ${initialFilter}"
          onerror="this.src='${DEFAULT_IMG}'"
        >
      </div>
      ${thumbs}
      ${renderProductColorPicker(product)}
    </div>
  `;
}

function setProductMainImage(container, src, filter = '') {
  const main = container.querySelector('#productDetailMainImg');
  if (!main) return;
  main.src = src;
  main.style.filter = filter;
  container.querySelectorAll('.pc-gallery-thumb').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.src === src);
  });
}

function syncColorPickerWithImage(container, src) {
  const picker = container.querySelector('.product-color-picker');
  if (!picker) return;
  const colorNameEl = container.querySelector('#selectedColorName');
  let matched = false;

  picker.querySelectorAll('.color-btn').forEach(btn => {
    const isMatch = btn.dataset.img === src;
    btn.classList.toggle('active', isMatch);
    if (isMatch) {
      matched = true;
      if (colorNameEl) colorNameEl.textContent = btn.dataset.name;
    }
  });

  if (!matched && colorNameEl && picker.querySelector('.color-btn.active')) {
    colorNameEl.textContent = picker.querySelector('.color-btn.active').dataset.name;
  }
}

function bindProductGallery(container) {
  container.querySelectorAll('.pc-gallery-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.src;
      const activeColor = container.querySelector('.product-color-picker .color-btn.active');
      const filter = activeColor && activeColor.dataset.img === src && activeColor.dataset.filter !== 'none'
        ? activeColor.dataset.filter
        : '';
      setProductMainImage(container, src, filter);
      syncColorPickerWithImage(container, src);
    });
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

      const filter = btn.dataset.filter === 'none' ? '' : btn.dataset.filter;
      setProductMainImage(container, btn.dataset.img, filter);
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

  const product = getEnrichedProductById(id);
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

function bootProducts() {
  if (document.getElementById('productDetailContent')) initProductDetailPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootProducts);
} else {
  bootProducts();
}
