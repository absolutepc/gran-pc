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

  rows.push({ label: 'На складе', value: `${product.stock != null ? product.stock : 0} шт.` });
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

function renderProductDetail(product) {
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;
  const safeName = escapeHtml(product.name);
  const safeCategory = escapeHtml(categoryLabel);
  const safeDescription = escapeHtml(product.description || '');
  const safeFullDescription = escapeHtml(product.fullDescription || product.description || '');
  const oldPriceHtml = product.oldPrice
    ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
    : '';
  const attrTags = PRODUCT_ATTRIBUTE_FIELDS
    .filter(f => product[f])
    .map(f => `<span class="product-attr-tag">${escapeHtml(product[f])}</span>`)
    .join('');

  return `
    <div class="pc-detail-hero">
      ${renderItemGallery(product, GALLERY_UI.product)}
      <div class="pc-detail-info">
        <div class="breadcrumbs">
          <a href="index.html">Главная</a> /
          <a href="catalog.html">Каталог</a> /
          <a href="catalog.html?cat=${escapeHtml(product.category)}">${safeCategory}</a> /
          <span>${safeName}</span>
        </div>
        <div class="product-category">${safeCategory}</div>
        <h1>${safeName}</h1>
        <p class="pc-detail-desc">${safeDescription}</p>
        ${attrTags ? `<div class="product-attrs product-detail-attrs">${attrTags}</div>` : ''}
        <div class="product-price pc-detail-price">${formatPrice(product.price)}${oldPriceHtml}</div>
        <div class="product-stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
          ${product.stock > 0 ? `✓ В наличии: ${product.stock} шт.` : 'Нет в наличии'}
        </div>
        <div class="pc-detail-actions">
          <button class="btn btn-primary btn-lg add-to-cart-btn" data-id="${escapeHtml(product.id)}" data-type="product">Добавить в корзину</button>
          <a href="catalog.html?cat=${escapeHtml(product.category)}" class="btn btn-secondary btn-lg">← К каталогу</a>
        </div>
      </div>
    </div>

    <section class="pc-detail-section">
      <h2>Описание</h2>
      <p class="pc-full-desc">${safeFullDescription}</p>
    </section>

    <section class="pc-detail-section">
      <h2>Характеристики</h2>
      <p class="section-sub">Подробные технические параметры компонента</p>
      ${renderProductSpecsTable(product)}
    </section>
  `;
}

function showProductPageError(container, message) {
  container.innerHTML = `
    <div class="container pc-detail-page" style="text-align:center;padding:60px 24px">
      <h2>Не удалось загрузить страницу товара</h2>
      <p style="color:var(--text-secondary);max-width:520px;margin:12px auto 24px">${escapeHtml(message)}</p>
      <a href="catalog.html" class="btn btn-primary">Вернуться в каталог</a>
    </div>
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

  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      container.innerHTML = `
        <div class="container pc-detail-page" style="text-align:center">
          <h2>Товар не указан</h2>
          <p style="color:var(--text-secondary);margin:12px 0 24px">Откройте товар из каталога через кнопку «Подробнее».</p>
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
          <p style="color:var(--text-secondary);margin:12px 0 24px">ID: ${escapeHtml(id)}</p>
          <a href="catalog.html" class="btn btn-primary">Перейти в каталог</a>
        </div>
      `;
      return;
    }

    document.title = `${product.name} — PC Market`;
    container.innerHTML = `<div class="container pc-detail-page">${renderProductDetail(product)}</div>`;
    bindItemGalleryAndColor(container, GALLERY_UI.product);
    bindAddToCartButtons(container);
    updateCartBadge();
  } catch (err) {
    console.error('PC Market: ошибка страницы товара', err);
    showProductPageError(container, err.message || String(err));
  }
}

function bootProductDetailPage() {
  if (!document.getElementById('productDetailContent')) return;
  initProductDetailPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootProductDetailPage);
} else {
  bootProductDetailPage();
}

