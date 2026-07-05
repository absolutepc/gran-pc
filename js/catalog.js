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

const CATALOG_PRICE_STEP = 1000;
const CATALOG_PRICE_FLOOR = 300000;

let catalogMaxProductPrice = CATALOG_PRICE_FLOOR;

function getCatalogMaxPrice(products) {
  const prices = (products || []).map(p => p.price || 0);
  const rawMax = prices.length ? Math.max(...prices) : CATALOG_PRICE_FLOOR;
  const target = Math.max(CATALOG_PRICE_FLOOR, rawMax);
  return Math.ceil(target / CATALOG_PRICE_STEP) * CATALOG_PRICE_STEP;
}

function updateCatalogPriceLabel(minVal, maxVal) {
  const label = document.getElementById('priceLabel');
  if (label) label.textContent = `${formatPrice(minVal)} — ${formatPrice(maxVal)}`;
}

function readCatalogPriceControls() {
  return {
    minRange: document.getElementById('priceMinRange'),
    maxRange: document.getElementById('priceMaxRange'),
    minInput: document.getElementById('priceMinInput'),
    maxInput: document.getElementById('priceMaxInput'),
  };
}

function snapCatalogPrice(value, ceiling) {
  const parsed = Math.round(+value / CATALOG_PRICE_STEP) * CATALOG_PRICE_STEP;
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(ceiling, parsed));
}

function applyCatalogPriceValues(minVal, maxVal) {
  const { minRange, maxRange, minInput, maxInput } = readCatalogPriceControls();
  const ceiling = catalogMaxProductPrice;
  let min = snapCatalogPrice(minVal, ceiling);
  let max = snapCatalogPrice(maxVal, ceiling);
  if (min > max) max = min;

  if (minRange) {
    minRange.max = ceiling;
    minRange.value = min;
  }
  if (maxRange) {
    maxRange.max = ceiling;
    maxRange.value = max;
  }
  if (minInput) {
    minInput.max = ceiling;
    minInput.value = min;
  }
  if (maxInput) {
    maxInput.max = ceiling;
    maxInput.value = max;
  }

  updateCatalogPriceLabel(min, max);
  return { min, max };
}

function getCatalogSelectedPrices() {
  const { minRange, maxRange } = readCatalogPriceControls();
  return {
    min: +(minRange?.value || 0),
    max: +(maxRange?.value || catalogMaxProductPrice),
  };
}

function syncCatalogPriceRange(products, resetValue = false) {
  const max = getCatalogMaxPrice(products);
  catalogMaxProductPrice = max;
  const { minRange, maxRange } = readCatalogPriceControls();
  if (!minRange || !maxRange) return max;

  if (resetValue) {
    applyCatalogPriceValues(0, max);
    return max;
  }

  applyCatalogPriceValues(+minRange.value, +maxRange.value);
  return max;
}

function handleCatalogPriceInput(sectionId, source) {
  const { minRange, maxRange, minInput, maxInput } = readCatalogPriceControls();
  if (!minRange || !maxRange) return;

  let minVal = +minRange.value;
  let maxVal = +maxRange.value;

  if (source === 'minInput') {
    minVal = minInput?.value ?? minVal;
    if (minVal > maxVal) maxVal = minVal;
  } else if (source === 'maxInput') {
    maxVal = maxInput?.value ?? maxVal;
    if (maxVal < minVal) minVal = maxVal;
  } else if (source === 'min') {
    minVal = +minRange.value;
    if (minVal > maxVal) maxVal = minVal;
  } else if (source === 'max') {
    maxVal = +maxRange.value;
    if (maxVal < minVal) minVal = maxVal;
  }

  applyCatalogPriceValues(minVal, maxVal);
  filterCatalogProducts(sectionId);
}

function renderCatalogFilterCheckboxes(containerId, values, cssClass, checkedValues = []) {
  const container = document.getElementById(containerId);
  const group = container?.closest('.filter-group');
  if (!container) return;
  const checked = new Set(Array.isArray(checkedValues) ? checkedValues : [checkedValues].filter(Boolean));
  if (!values.length) {
    if (group) group.style.display = 'none';
    container.innerHTML = '';
    return;
  }
  if (group) group.style.display = '';
  container.innerHTML = values.map(value => `
    <label>
      <input type="checkbox" value="${value}" class="${cssClass}" ${checked.has(value) ? 'checked' : ''}>
      ${value}
    </label>
  `).join('');
}

function getCatalogFilterBasis(activeSectionId) {
  const checkedCats = getCatalogCheckedValues('.cat-filter');
  let products = getProducts().filter(product => productMatchesCatalogSection(product, activeSectionId));
  if (checkedCats.length) products = products.filter(p => checkedCats.includes(p.category));
  return products;
}

function refreshCatalogAttributeFilters(activeSectionId, params = null) {
  const basis = getCatalogFilterBasis(activeSectionId);

  CATALOG_ATTRIBUTE_FILTERS.forEach(({ id, field, options, param, className }) => {
    const available = getAvailableFilterValues(basis, field, options);
    const preserved = getCatalogCheckedValues('.' + className).filter(value => available.includes(value));
    const urlValue = params?.get(param);
    const checkedValues = urlValue && available.includes(urlValue) && !preserved.includes(urlValue)
      ? [...preserved, urlValue]
      : preserved;

    renderCatalogFilterCheckboxes(id, available, className, checkedValues);
  });
}

function bindCatalogPriceControls(sectionId) {
  document.getElementById('priceMinRange').oninput = () => handleCatalogPriceInput(sectionId, 'min');
  document.getElementById('priceMaxRange').oninput = () => handleCatalogPriceInput(sectionId, 'max');
  document.getElementById('priceMinInput').onchange = () => handleCatalogPriceInput(sectionId, 'minInput');
  document.getElementById('priceMaxInput').onchange = () => handleCatalogPriceInput(sectionId, 'maxInput');
  document.getElementById('priceMinInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleCatalogPriceInput(sectionId, 'minInput');
  });
  document.getElementById('priceMaxInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') handleCatalogPriceInput(sectionId, 'maxInput');
  });
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

function filterCatalogProducts(activeSectionId) {
  refreshCatalogAttributeFilters(activeSectionId);
  let products = getProducts().filter(product => productMatchesCatalogSection(product, activeSectionId));
  syncCatalogPriceRange(getProducts());
  const checkedCats = getCatalogCheckedValues('.cat-filter');
  const checkedBadges = getCatalogCheckedValues('.badge-filter');
  const { min: minPrice, max: maxPrice } = getCatalogSelectedPrices();
  const sort = document.getElementById('sortSelect').value;

  if (checkedCats.length) products = products.filter(p => checkedCats.includes(p.category));
  CATALOG_ATTRIBUTE_FILTERS.forEach(({ field, className }) => {
    products = products.filter(p => matchesAttributeFilter(p, field, getCatalogCheckedValues('.' + className)));
  });
  if (checkedBadges.length) products = products.filter(p => checkedBadges.includes(p.badge));
  products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

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
  syncCatalogPriceRange(getProducts(), true);

  initCatalogCategoryFilters(section, params.get('cat'));
  refreshCatalogAttributeFilters(section.id, params);

  const sidebar = document.querySelector('.filters-sidebar');
  sidebar.onchange = (event) => {
    if (event.target.matches('input[type="checkbox"]')) filterCatalogProducts(section.id);
  };

  bindCatalogPriceControls(section.id);
  document.getElementById('sortSelect').onchange = () => filterCatalogProducts(section.id);
  document.getElementById('resetFilters').onclick = () => {
    document.querySelectorAll('.filters-sidebar input[type="checkbox"]').forEach(c => {
      c.checked = false;
    });
    applyCatalogPriceValues(0, catalogMaxProductPrice);
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
