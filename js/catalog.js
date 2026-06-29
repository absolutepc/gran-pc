const CATALOG_ATTRIBUTE_FILTERS = [
  { id: 'brandFilters', field: 'brand', options: FILTER_BRANDS, param: 'brand', className: 'brand-filter' },
  { id: 'socketFilters', field: 'socket', options: FILTER_SOCKETS, param: 'socket', className: 'socket-filter' },
  { id: 'memoryTypeFilters', field: 'memoryType', options: FILTER_MEMORY_TYPES, param: 'memory', className: 'memory-filter' },
  { id: 'pcieFilters', field: 'pcie', options: FILTER_PCIE, param: 'pcie', className: 'pcie-filter' },
  { id: 'ramFilters', field: 'ram', options: FILTER_RAM, param: 'ram', className: 'ram-filter' },
  { id: 'liquidFilters', field: 'liquid', options: FILTER_LIQUID, param: 'liquid', className: 'liquid-filter' },
  { id: 'psutypeFilters', field: 'psutype', options: FILTER_PSUTYPE, param: 'psutype', className: 'psutype-filter' },
  { id: 'caseffFilters', field: 'caseff', options: FILTER_CASEFF, param: 'caseff', className: 'caseff-filter' },
  { id: 'inchFilters', field: 'inch', options: FILTER_INCH, param: 'inch', className: 'inch-filter' },
  { id: 'matrixFilters', field: 'matrix', options: FILTER_MATRIX, param: 'matrix', className: 'matrix-filter' },
  { id: 'hertzFilters', field: 'hertz', options: FILTER_HERTZ, param: 'hertz', className: 'hertz-filter' },
  { id: 'qualityFilters', field: 'quality', options: FILTER_QUALITY, param: 'quality', className: 'quality-filter' },
  { id: 'wiredFilters', field: 'wired', options: FILTER_WIRED, param: 'wired', className: 'wired-filter' },
];

let catalogMaxProductPrice = 300000;

function renderCatalogFilterCheckboxes(containerId, values, cssClass, initialValue) {
  const container = document.getElementById(containerId);
  const group = container?.closest('.filter-group');
  if (!container) return;
  if (!values.length) {
    if (group) group.style.display = 'none';
    container.innerHTML = '';
    return;
  }
  if (group) group.style.display = '';
  container.innerHTML = values.map(value => `
    <label>
      <input type="checkbox" value="${value}" class="${cssClass}" ${initialValue === value ? 'checked' : ''}>
      ${value}
    </label>
  `).join('');
}

function getCatalogCheckedValues(selector) {
  return [...document.querySelectorAll(selector + ':checked')].map(c => c.value);
}

function getCatalogSectionProducts(sectionId) {
  return getProducts().filter(product => productMatchesCatalogSection(product, sectionId));
}

function renderCatalogSectionCard(section) {
  const count = getCatalogSectionProducts(section.id).length;
  const countLabel = count === 1 ? '1 товар' : count >= 2 && count <= 4 ? `${count} товара` : `${count} товаров`;
  return `
    <a href="catalog.html?section=${section.id}" class="catalog-section-card" data-transition-label="${escapeHtml(section.name)}">
      <div class="catalog-section-card__media">
        <img src="${section.img}" alt="${escapeHtml(section.name)}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'">
      </div>
      <div class="catalog-section-card__body">
        <h2>${escapeHtml(section.name)}</h2>
        <p>${escapeHtml(section.description)}</p>
        <span class="catalog-section-card__count">${countLabel}</span>
      </div>
    </a>
  `;
}

function renderCatalogSectionsView() {
  document.getElementById('catalogSectionsGrid').innerHTML = CATALOG_SECTIONS
    .map(renderCatalogSectionCard)
    .join('');
}

function resolveCatalogSectionId(params) {
  const sectionParam = params.get('section');
  if (sectionParam && getCatalogSectionById(sectionParam)) return sectionParam;

  const catParam = params.get('cat');
  if (catParam) {
    const section = CATALOG_SECTIONS.find(entry => entry.categories.includes(catParam));
    if (section) return section.id;
  }

  return null;
}

function updateCatalogHeader(section) {
  const titleEl = document.getElementById('catalogTitle');
  const subtitleEl = document.getElementById('catalogSubtitle');
  const breadcrumbEl = document.getElementById('catalogBreadcrumbCurrent');

  if (!section) {
    titleEl.textContent = 'Каталог товаров';
    subtitleEl.textContent = 'Выберите раздел, чтобы посмотреть ассортимент';
    breadcrumbEl.textContent = 'Каталог';
    document.title = 'Каталог — PC Market';
    return;
  }

  titleEl.textContent = section.name;
  subtitleEl.textContent = section.description;
  breadcrumbEl.innerHTML = `<a href="catalog.html">Каталог</a> / ${escapeHtml(section.name)}`;
  document.title = `${section.name} — PC Market`;
}

function showCatalogSectionsView() {
  document.getElementById('catalogSectionsView').hidden = false;
  document.getElementById('catalogProductsView').hidden = true;
  updateCatalogHeader(null);
  renderCatalogSectionsView();
}

function showCatalogProductsView(section) {
  document.getElementById('catalogSectionsView').hidden = true;
  document.getElementById('catalogProductsView').hidden = false;
  updateCatalogHeader(section);
}

function initCatalogCategoryFilters(section, initialCat) {
  const categoryFilters = document.getElementById('categoryFilters');
  categoryFilters.innerHTML = section.categories.map(key => `
    <label>
      <input type="checkbox" value="${key}" class="cat-filter" ${initialCat === key ? 'checked' : ''}>
      ${CATEGORY_LABELS[key] || key}
    </label>
  `).join('');
}

function initCatalogAttributeFilters(sectionProducts, params) {
  CATALOG_ATTRIBUTE_FILTERS.forEach(({ id, field, options, param, className }) => {
    renderCatalogFilterCheckboxes(
      id,
      getAvailableFilterValues(sectionProducts, field, options),
      className,
      params.get(param)
    );
  });
}

function filterCatalogProducts(activeSectionId) {
  let products = getProducts().filter(product => productMatchesCatalogSection(product, activeSectionId));
  const checkedCats = getCatalogCheckedValues('.cat-filter');
  const checkedBadges = getCatalogCheckedValues('.badge-filter');
  const maxPrice = +document.getElementById('priceRange').value;
  const sort = document.getElementById('sortSelect').value;

  if (checkedCats.length) products = products.filter(p => checkedCats.includes(p.category));
  CATALOG_ATTRIBUTE_FILTERS.forEach(({ field, className }) => {
    products = products.filter(p => matchesAttributeFilter(p, field, getCatalogCheckedValues('.' + className)));
  });
  if (checkedBadges.length) products = products.filter(p => checkedBadges.includes(p.badge));
  products = products.filter(p => p.price <= maxPrice);

  if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'name') products.sort((a, b) => a.name.localeCompare(b.name, 'ru'));

  document.getElementById('resultsCount').textContent = `Найдено: ${products.length}`;
  document.getElementById('catalogGrid').innerHTML = products.length
    ? products.map(p => renderProductCard(p)).join('')
    : '<div class="no-results"><div class="no-results-icon">🔍</div><p>Нет товаров по выбранным фильтрам</p></div>';
  bindAddToCartButtons(document.getElementById('catalogGrid'));
}

function initCatalogProductsView(section, params) {
  const sectionProducts = getCatalogSectionProducts(section.id);
  catalogMaxProductPrice = Math.max(300000, ...getProducts().map(p => p.price || 0));

  const priceRange = document.getElementById('priceRange');
  priceRange.max = catalogMaxProductPrice;
  priceRange.value = catalogMaxProductPrice;
  document.getElementById('priceLabel').textContent = `₽0 — ${formatPrice(catalogMaxProductPrice)}`;

  initCatalogCategoryFilters(section, params.get('cat'));
  initCatalogAttributeFilters(sectionProducts, params);

  const sidebar = document.querySelector('.filters-sidebar');
  sidebar.onchange = (event) => {
    if (event.target.matches('input[type="checkbox"]')) filterCatalogProducts(section.id);
  };

  document.getElementById('priceRange').oninput = (event) => {
    document.getElementById('priceLabel').textContent = `₽0 — ${formatPrice(+event.target.value)}`;
    filterCatalogProducts(section.id);
  };
  document.getElementById('sortSelect').onchange = () => filterCatalogProducts(section.id);
  document.getElementById('resetFilters').onclick = () => {
    document.querySelectorAll('.filters-sidebar input[type="checkbox"]').forEach(c => {
      c.checked = false;
    });
    document.getElementById('priceRange').value = catalogMaxProductPrice;
    document.getElementById('priceLabel').textContent = `₽0 — ${formatPrice(catalogMaxProductPrice)}`;
    filterCatalogProducts(section.id);
  };

  filterCatalogProducts(section.id);
}

function initCatalogPage() {
  const params = new URLSearchParams(window.location.search);
  const sectionId = resolveCatalogSectionId(params);
  const section = sectionId ? getCatalogSectionById(sectionId) : null;

  if (!section) {
    showCatalogSectionsView();
    return;
  }

  showCatalogProductsView(section);
  initCatalogProductsView(section, params);
}
