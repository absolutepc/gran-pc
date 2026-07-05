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

        <h3>${pc.name}</h3>

        ${renderRatingSummary(pc.id, 'ready-pc')}

        <p>${pc.description || ''}</p>

        <div class="pc-spec-tags">

          ${(pc.specs || []).map(s => `<span class="pc-spec-tag">${s}</span>`).join('')}

        </div>

        ${renderPerfBars(pc)}

        <div class="product-footer ready-pc-footer">

          <div class="product-price">${formatPrice(pc.price)}</div>

          <div class="ready-pc-actions">

            <a href="ready-pc.html?id=${pc.id}" class="btn btn-secondary btn-sm">Подробнее</a>

            <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${pc.id}" data-type="ready-pc">В корзину</button>

          </div>

        </div>

      </div>

    </div>

  `;

}



function renderPCGallery(pc) {

  const images = pc.images?.length ? pc.images : [getProductImg(pc)];

  const main = images[0];

  const thumbs = images.length > 1

    ? `<div class="pc-gallery-thumbs">${images.map((src, i) => `

        <button type="button" class="pc-gallery-thumb ${i === 0 ? 'active' : ''}" data-src="${src}" aria-label="Фото ${i + 1}">

          ${renderProductImg(src, pc.name)}

        </button>

      `).join('')}</div>`

    : '';



  return `

    <div class="pc-detail-gallery">

      <div class="pc-detail-image-wrap">

        ${pc.badge ? `<span class="product-badge ${pc.badge}">${BADGE_LABELS[pc.badge] || pc.badge}</span>` : ''}

        <img class="pc-detail-main-img" id="pcDetailMainImg" src="${main}" alt="${pc.name}" onerror="this.src='${DEFAULT_IMG}'">

      </div>

      ${thumbs}

    </div>

  `;

}



function bindPCGallery(container) {

  const main = container.querySelector('#pcDetailMainImg');

  container.querySelectorAll('.pc-gallery-thumb').forEach(btn => {

    btn.addEventListener('click', () => {

      container.querySelectorAll('.pc-gallery-thumb').forEach(b => b.classList.remove('active'));

      btn.classList.add('active');

      if (main) main.src = btn.dataset.src;

    });

  });

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

          <h4>${comp.name}</h4>

          <p>${comp.description || ''}</p>

        </div>

      `).join('')}

    </div>

  `;

}



function renderReadyPCDetail(pc) {

  return `

    <div class="pc-detail-hero">

      ${renderPCGallery(pc)}

      <div class="pc-detail-info">

        <div class="breadcrumbs"><a href="index.html">Главная</a> / <a href="ready-pcs.html">Готовые ПК</a> / <span>${pc.name}</span></div>

        <h1>${pc.name}</h1>

        ${renderRatingSummary(pc.id, 'ready-pc', { variant: 'hero' })}

        <p class="pc-detail-desc">${pc.description || ''}</p>

        <div class="product-price pc-detail-price">${formatPrice(pc.price)}</div>

        <div class="pc-spec-tags">${(pc.specs || []).map(s => `<span class="pc-spec-tag">${s}</span>`).join('')}</div>

        ${renderPerfBars(pc)}

        <div class="pc-detail-actions">

          <button class="btn btn-primary btn-lg add-to-cart-btn" data-id="${pc.id}" data-type="ready-pc">Добавить в корзину</button>

          <a href="ready-pcs.html" class="btn btn-secondary btn-lg">← Все сборки</a>

        </div>

      </div>

    </div>



    <section class="pc-detail-section">

      <h2>Описание</h2>

      <p class="pc-full-desc">${pc.fullDescription || pc.description || ''}</p>

    </section>



    <section class="pc-detail-section">

      <h2>Комплектация</h2>

      <p class="section-sub">Каждый компонент подобран для максимальной совместимости и производительности</p>

      ${renderPCComponents(pc)}

    </section>

    ${renderReviewsSection(pc.id, 'ready-pc')}

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

  const params = new URLSearchParams(window.location.search);

  const id = params.get('id');

  const container = document.getElementById('pcDetailContent');

  if (!container) return;



  if (!id) {

    container.innerHTML = '<div class="container pc-detail-page" style="text-align:center"><h2>Сборка не указана</h2><a href="ready-pcs.html" class="btn btn-primary">К готовым ПК</a></div>';

    return;

  }



  const pc = getReadyPCById(id);

  if (!pc) {

    container.innerHTML = '<div class="container pc-detail-page" style="text-align:center"><h2>ПК не найден</h2><a href="ready-pcs.html" class="btn btn-primary">К готовым ПК</a></div>';

    return;

  }



  document.title = `${pc.name} — PC Market`;

  container.innerHTML = `<div class="container pc-detail-page">${renderReadyPCDetail(pc)}</div>`;

  bindPCGallery(container);

  bindAddToCartButtons(container);

  bindReviewsSection(container, pc.id, 'ready-pc');

  updateCartBadge();

}



function bootReadyPCs() {

  if (document.getElementById('readyPCsGrid')) initReadyPCsPage();

  if (document.getElementById('pcDetailContent')) initReadyPCDetailPage();

}



if (document.readyState === 'loading') {

  document.addEventListener('DOMContentLoaded', bootReadyPCs);

} else {

  bootReadyPCs();

}

