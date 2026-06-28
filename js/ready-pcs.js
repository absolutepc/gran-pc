const COLOR_AWARE_COMPONENT_TYPES = new Set(['case', 'cooling', 'ram', 'gpu']);
const WHITE_COMPONENT_FILTER = 'brightness(0) invert(1)';
const PINK_COMPONENT_FILTER = 'hue-rotate(300deg) saturate(1.4)';

function stripComponentColorSuffix(name) {
  return (name || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function isWhiteColorName(name) {
  return /бел|white/i.test(name || '');
}

function isPinkColorName(name) {
  return /розов|pink/i.test(name || '');
}

function isRgbColorName(name) {
  return /rgb|фиолет|violet|purple/i.test(name || '');
}

function swapComponentImgForColor(src, colorName) {
  if (!src || /\/categories\//.test(src)) return src;

  if (isWhiteColorName(colorName)) {
    return src
      .replace(/\bBlack\b/g, 'White')
      .replace(/\bblack\b/g, 'white')
      .replace(/-B\./g, '-W.')
      .replace(/\bB\.png/g, 'W.png')
      .replace(/mod-3-black/g, 'mod-3-white')
      .replace(/D400-B/g, 'D400-W')
      .replace(/D32 PRO Black/g, 'D32 PRO White')
      .replace(/D32 STD Black/g, 'D32 STD White')
      .replace(/D41 MESH Black/g, 'D41 MESH White')
      .replace(/D41 STD Black/g, 'D41 STD White')
      .replace(/C6 MAX Black/g, 'C6 MAX White')
      .replace(/O11VP_014a/g, 'O11VP_W01')
      .replace(/O11VP_000a/g, 'O11VP_X01')
      .replace(/O11VP_001a/g, 'O11VP_W01')
      .replace(/O11VP_020/g, 'O11VP_W01');
  }

  if (isPinkColorName(colorName) && /mod-3-(black|white)/.test(src)) {
    return src.replace(/mod-3-(black|white)/g, 'mod-3-pink');
  }

  return src;
}

function resolveReadyPCComponents(pc, colorIndex = 0) {
  const color = pc.colors?.[colorIndex];
  const base = pc.components || [];
  if (!color) return base;

  const overrides = color.componentOverrides || {};
  const colorName = color.name || '';
  const colorFilter = color.filter && color.filter !== 'none' ? color.filter : '';
  const caseImg = color.img || color.images?.[0];

  return base.map(comp => {
    const override = overrides[comp.type] || {};
    let img = override.img || comp.img;
    let name = override.name || comp.name;
    let imgFilter = override.imgFilter || '';

    if (comp.type === 'case') {
      img = override.img || caseImg || comp.img;
      name = `${stripComponentColorSuffix(name)} (${colorName})`;
      imgFilter = override.imgFilter ?? colorFilter;
    } else if (COLOR_AWARE_COMPONENT_TYPES.has(comp.type)) {
      const swapped = swapComponentImgForColor(comp.img, colorName);
      if (swapped !== comp.img) img = swapped;

      if (!override.imgFilter && /\/categories\//.test(img)) {
        if (isWhiteColorName(colorName)) imgFilter = WHITE_COMPONENT_FILTER;
        else if (isPinkColorName(colorName)) imgFilter = PINK_COMPONENT_FILTER;
        else if (isRgbColorName(colorName) && colorFilter) imgFilter = colorFilter;
      }

      if (override.img) img = override.img;
      if (override.imgFilter) imgFilter = override.imgFilter;
    }

    return { ...comp, img, name, imgFilter };
  });
}

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

function renderComponentMedia(comp) {
  const src = comp.img || DEFAULT_IMG;
  const filterStyle = comp.imgFilter ? `filter:${comp.imgFilter};` : '';
  return `<img src="${src}" alt="${escapeHtml(comp.name || '')}" data-component-img style="${filterStyle}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'">`;
}

function renderPCComponents(components) {
  if (!components?.length) {
    return '<p class="section-sub">Подробная комплектация будет добавлена позже.</p>';
  }
  return `
    <div class="pc-components-zigzag" id="pcComponentsList">
      ${components.map((comp, index) => {
        const reverseClass = index % 2 === 1 ? ' pc-component-row--reverse' : '';
        return `
          <article class="pc-component-row${reverseClass}" data-component-type="${escapeHtml(comp.type)}">
            <div class="pc-component-media">
              ${renderComponentMedia(comp)}
            </div>
            <div class="pc-component-body">
              <div class="pc-component-type">${COMPONENT_TYPE_LABELS[comp.type] || comp.type}</div>
              <h4 data-component-name>${escapeHtml(comp.name)}</h4>
              <p>${escapeHtml(comp.description || '')}</p>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function updatePCComponentsForColor(container, pc, colorIndex = 0) {
  const components = resolveReadyPCComponents(pc, colorIndex);
  const list = container.querySelector('#pcComponentsList');
  if (!list) return;

  components.forEach(comp => {
    const row = list.querySelector(`[data-component-type="${CSS.escape(comp.type)}"]`);
    if (!row) return;

    const img = row.querySelector('[data-component-img]');
    const title = row.querySelector('[data-component-name]');
    if (img) {
      img.src = comp.img || DEFAULT_IMG;
      img.style.filter = comp.imgFilter || '';
    }
    if (title) title.textContent = comp.name;
  });
}

function renderReadyPCDetail(pc) {
  const initialComponents = resolveReadyPCComponents(pc, 0);
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
      ${renderPCComponents(initialComponents)}
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

    document.title = `${pc.name} — PC Market`;
    if (typeof updatePageTransitionLabel === 'function') {
      updatePageTransitionLabel(pc.name);
    }
    container.innerHTML = `<div class="container pc-detail-page">${renderReadyPCDetail(pc)}</div>`;
    bindItemGalleryAndColor(container, GALLERY_UI.readyPc, pc, {
      onColorChange: (colorIndex) => updatePCComponentsForColor(container, pc, colorIndex),
    });
    bindAddToCartButtons(container);
    updateCartBadge();
  } catch (err) {
    console.error('PC Market: ошибка страницы готового ПК', err);
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
