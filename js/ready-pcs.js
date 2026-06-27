function renderPerfBars(pc) {
  if (!pc.performance) return '';
  return Object.entries(pc.performance).map(([key, val]) => `
    <div class="perf-bar-row">
      <div class="perf-bar-header">
        <span>${PERFORMANCE_LABELS[key] || key}</span>
        <span>${val}%</span>
      </div>
      <div class="perf-bar-track"><div class="perf-bar-fill" style="width:${val}%"></div></div>
    </div>
  `).join('');
}

function renderReadyPCCard(pc) {
  const badgeHtml = pc.badge
    ? `<span class="product-badge ${pc.badge}">${BADGE_LABELS[pc.badge] || pc.badge}</span>`
    : '';
  const imgSrc = getProductImg(pc);

  return `
    <div class="product-card ready-pc-card" data-id="${pc.id}" data-type="ready-pc">
      <div class="product-image">
        ${badgeHtml}
        ${renderProductImg(imgSrc, pc.name)}
      </div>
      <div class="product-info">
        <div class="product-category">Готовый ПК</div>
        <h3>${escapeHtml(pc.name)}</h3>
        <p>${escapeHtml(pc.description || '')}</p>
        <div class="pc-spec-tags">
          ${(pc.specs || []).map(s => `<span class="pc-spec-tag">${escapeHtml(s)}</span>`).join('')}
        </div>
        ${renderPerfBars(pc)}
        <div class="product-footer ready-pc-footer">
          <div class="product-price">${formatPrice(pc.price)}</div>
          <div class="ready-pc-actions">
            <a href="ready-pc.html?id=${escapeHtml(pc.id)}" class="btn btn-secondary btn-sm" data-transition-label="${escapeHtml(pc.name)}">Подробнее</a>
            <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${pc.id}" data-type="ready-pc">В корзину</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPCComponents(pc) {
  if (!pc.components?.length) {
    return '<p class="section-sub">Подробная комплектация будет добавлена позже.</p>';
  }
  return `
    <div class="pc-components-grid">
      ${pc.components.map(comp => `
        <div class="pc-component-card">
          <div class="pc-component-img">${renderProductImg(comp.img, comp.name)}</div>
          <div class="pc-component-type">${COMPONENT_TYPE_LABELS[comp.type] || comp.type}</div>
          <h4>${escapeHtml(comp.name)}</h4>
          <p>${escapeHtml(comp.description || '')}</p>
        </div>
      `).join('')}
    </div>
  `;
}

function renderReadyPCDetail(pc) {
  return `
    <div class="pc-detail-hero">
      ${renderItemGallery(pc, GALLERY_UI.readyPc)}
      <div class="pc-detail-info">
        <div class="breadcrumbs">
          <a href="index.html">Главная</a> /
          <a href="ready-pcs.html">Готовые ПК</a> /
          <span>${escapeHtml(pc.name)}</span>
        </div>
        <h1>${escapeHtml(pc.name)}</h1>
        <p class="pc-detail-desc">${escapeHtml(pc.description || '')}</p>
        <div class="product-price pc-detail-price">${formatPrice(pc.price)}</div>
        <div class="pc-spec-tags">${(pc.specs || []).map(s => `<span class="pc-spec-tag">${escapeHtml(s)}</span>`).join('')}</div>
        ${renderPerfBars(pc)}
        <div class="pc-detail-actions">
          <button class="btn btn-primary btn-lg add-to-cart-btn" data-id="${pc.id}" data-type="ready-pc">Добавить в корзину</button>
          <a href="ready-pcs.html" class="btn btn-secondary btn-lg">← Все сборки</a>
        </div>
      </div>
    </div>

    <section class="pc-detail-section">
      <h2>Описание</h2>
      <p class="pc-full-desc">${escapeHtml(pc.fullDescription || pc.description || '')}</p>
    </section>

    <section class="pc-detail-section">
      <h2>Комплектация</h2>
      <p class="section-sub">Каждый компонент подобран для максимальной совместимости и производительности</p>
      ${renderPCComponents(pc)}
    </section>
  `;
}

function initReadyPCsPage() {
  const grid = document.getElementById('readyPCsGrid');
  if (!grid) return;
  const pcs = getReadyPCs();
  if (!pcs.length) {
    grid.innerHTML = '<p style="color:var(--text-secondary);text-align:center;grid-column:1/-1">Сборки не найдены.</p>';
    return;
  }
  grid.innerHTML = pcs.map(renderReadyPCCard).join('');
  bindAddToCartButtons(grid);
  updateCartBadge();
}

function initReadyPCDetailPage() {
  const container = document.getElementById('pcDetailContent');
  if (!container) return;

  try {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      container.innerHTML = '<div class="container pc-detail-page" style="text-align:center"><h2>Сборка не указана</h2><a href="ready-pcs.html" class="btn btn-primary">К готовым ПК</a></div>';
      return;
    }

    const pc = getReadyPCById(id);
    if (!pc) {
      container.innerHTML = `<div class="container pc-detail-page" style="text-align:center"><h2>ПК не найден</h2><p style="color:var(--text-secondary);margin:12px 0 24px">ID: ${escapeHtml(id)}</p><a href="ready-pcs.html" class="btn btn-primary">К готовым ПК</a></div>`;
      return;
    }

    document.title = `${pc.name} — ${SITE_NAME}`;
    if (typeof updatePageTransitionLabel === 'function') {
      updatePageTransitionLabel(pc.name);
    }
    container.innerHTML = `<div class="container pc-detail-page">${renderReadyPCDetail(pc)}</div>`;
    bindItemGalleryAndColor(container, GALLERY_UI.readyPc);
    bindAddToCartButtons(container);
    updateCartBadge();
  } catch (err) {
    console.error(`${SITE_NAME}: ошибка страницы готового ПК`, err);
    container.innerHTML = `
      <div class="container pc-detail-page" style="text-align:center;padding:60px 24px">
        <h2>Не удалось загрузить страницу сборки</h2>
        <p style="color:var(--text-secondary);max-width:520px;margin:12px auto 24px">
          ${escapeHtml(err.message || String(err))}. Убедитесь, что файлы js/gallery.js и js/ready-pcs.js загружены,
          и откройте сайт через Live Server.
        </p>
        <a href="ready-pcs.html" class="btn btn-primary">К готовым ПК</a>
      </div>
    `;
  }
}

function bootReadyPCs() {
  if (document.getElementById('readyPCsGrid')) initReadyPCsPage();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootReadyPCs);
} else {
  bootReadyPCs();
}
