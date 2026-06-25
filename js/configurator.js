const CONFIG_LABELS = {
  cpu: 'Процессор',
  gpu: 'Видеокарта',
  ram: 'Память',
  storage: 'Накопитель',
  motherboard: 'Материнская плата',
  psu: 'Блок питания',
  cooling: 'Охлаждение',
  case: 'Корпус',
};

const CONFIG_STEP_SHORT = {
  cpu: 'CPU',
  gpu: 'GPU',
  ram: 'RAM',
  storage: 'SSD',
  motherboard: 'MB',
  psu: 'PSU',
  cooling: 'COOL',
  case: 'CASE',
};

const CONFIG_CATEGORY_IMAGES = {
  cpu: 'img/categories/cpu.svg',
  gpu: 'img/categories/gpu.svg',
  ram: 'img/categories/ram.svg',
  storage: 'img/categories/storage.svg',
  motherboard: 'img/categories/motherboard.svg',
  psu: 'img/categories/psu.svg',
  cooling: 'img/categories/cooling.svg',
  case: 'img/categories/case.svg',
};

const CONFIG_DRAFT_KEY = 'pcmarket_config_draft';

const PERF_WEIGHTS = {
  gaming: { gpu: 0.45, cpu: 0.32, ram: 0.06, storage: 0.04, motherboard: 0.03, cooling: 0.05, psu: 0.03, case: 0.02 },
  work: { cpu: 0.34, ram: 0.22, storage: 0.18, gpu: 0.12, motherboard: 0.05, cooling: 0.04, psu: 0.03, case: 0.02 },
  streaming: { gpu: 0.28, cpu: 0.28, ram: 0.16, storage: 0.06, motherboard: 0.04, cooling: 0.08, psu: 0.05, case: 0.05 },
};

const TIER_SCORES = { 1: 52, 2: 68, 3: 82, 4: 96 };

let selectedConfig = {};
let activeCategory = 'cpu';
let previousTotal = 0;

function getConfigCategories() {
  return Object.keys(CONFIG_COMPONENTS);
}

function tierToScore(tier) {
  return TIER_SCORES[tier] || TIER_SCORES[2];
}

function calculateConfigPerformance(config) {
  const result = {};
  Object.entries(PERF_WEIGHTS).forEach(([profile, weights]) => {
    let score = 0;
    Object.entries(weights).forEach(([cat, weight]) => {
      const comp = config[cat];
      if (comp) score += tierToScore(comp.tier || 2) * weight;
    });
    result[profile] = Math.round(Math.min(100, Math.max(0, score)));
  });
  return result;
}

function getCriticalCompatibilityIssues(config) {
  const cpu = config.cpu;
  const mb = config.motherboard;
  if (cpu?.socket && mb?.socket && cpu.socket !== mb.socket) {
    return [`Несовместимость: процессор (${cpu.socket}) и материнская плата (${mb.socket})`];
  }
  return [];
}

function getConfigCompatibilityIssues(config) {
  const issues = [...getCriticalCompatibilityIssues(config)];
  const gpuTier = config.gpu?.tier || 2;
  const psuTier = config.psu?.tier || 2;
  if (gpuTier >= 4 && psuTier < 3) {
    issues.push('Для топовой видеокарты рекомендуем блок питания от 850W');
  }
  if ((config.cpu?.tier || 2) >= 4 && (config.cooling?.tier || 2) <= 1) {
    issues.push('Мощному процессору желательно более производительное охлаждение');
  }
  return issues;
}

function getCasePreviewImg(config) {
  return config.case?.previewImg || config.case?.img || 'img/hero-pc.svg';
}

function renderConfigBadges(opt) {
  const badges = [];
  if (opt.recommended) badges.push('<span class="config-option-badge recommended">Рекомендуем</span>');
  if (opt.gamingPick) badges.push('<span class="config-option-badge gaming">Для игр</span>');
  return badges.length ? `<div class="config-option-badges">${badges.join('')}</div>` : '';
}

function renderPriceDelta(category, opt) {
  const current = selectedConfig[category];
  if (!current || current.id === opt.id) return '';
  const delta = opt.price - current.price;
  if (delta === 0) return '';
  const sign = delta > 0 ? '+' : '−';
  const cls = delta > 0 ? 'up' : 'down';
  return `<span class="config-price-delta ${cls}">${sign}${formatPrice(Math.abs(delta))}</span>`;
}

function renderComponentCard(category, opt, isSelected) {
  const img = opt.img || CONFIG_CATEGORY_IMAGES[category] || DEFAULT_IMG;
  const specTags = (opt.specs || '').split(/[,/|]/).map(s => s.trim()).filter(Boolean);
  return `
    <label class="config-option-card ${isSelected ? 'selected' : ''}" data-category="${category}" data-id="${opt.id}">
      <input type="radio" name="${category}" value="${opt.id}" ${isSelected ? 'checked' : ''} aria-label="${escapeHtml(opt.name)}">
      <span class="config-option-check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
      ${renderConfigBadges(opt)}
      <div class="config-option-image">
        <img src="${escapeHtml(img)}" alt="" loading="lazy" onerror="this.src='${DEFAULT_IMG}'">
      </div>
      <div class="config-option-body">
        <div class="config-option-name">${escapeHtml(opt.name)}</div>
        <div class="config-option-specs">
          ${specTags.map(tag => `<span class="product-attr-tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
      <div class="config-option-footer">
        <span class="config-option-price">${formatPrice(opt.price)}</span>
        ${renderPriceDelta(category, opt)}
      </div>
    </label>
  `;
}

function renderConfigPreview() {
  const preview = document.getElementById('configPreview');
  if (!preview) return;

  const caseImg = getCasePreviewImg(selectedConfig);
  const perf = calculateConfigPerformance(selectedConfig);
  const badges = ['gpu', 'cpu', 'ram'].map(key => {
    const comp = selectedConfig[key];
    if (!comp) return '';
    const icon = CONFIG_CATEGORY_IMAGES[key];
    return `
      <div class="config-preview-badge" title="${escapeHtml(CONFIG_LABELS[key])}: ${escapeHtml(comp.name)}">
        <img src="${icon}" alt="">
        <span>${escapeHtml(comp.name.split(' ').slice(-2).join(' '))}</span>
      </div>
    `;
  }).join('');

  preview.innerHTML = `
    <div class="config-preview-visual">
      <div class="config-preview-glow"></div>
      <img class="config-preview-img" src="${escapeHtml(caseImg)}" alt="Превью сборки" onerror="this.src='img/hero-pc.svg'">
      <div class="config-preview-badges">${badges}</div>
    </div>
    <div class="config-preview-perf">
      <h4>Оценка конфигурации</h4>
      ${Object.entries(perf).map(([key, val]) => `
        <div class="perf-bar-row">
          <div class="perf-bar-header">
            <span>${PERFORMANCE_LABELS[key] || key}</span>
            <span>${val}%</span>
          </div>
          <div class="perf-bar-track"><div class="perf-bar-fill" style="width:${val}%"></div></div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderConfigSteps() {
  const stepsEl = document.getElementById('configSteps');
  if (!stepsEl) return;

  const categories = getConfigCategories();
  stepsEl.innerHTML = categories.map((key, index) => {
    const isActive = key === activeCategory;
    const isCompleted = !!selectedConfig[key];
    const icon = CONFIG_CATEGORY_IMAGES[key];
    return `
      <button
        type="button"
        class="config-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}"
        data-category="${key}"
        role="tab"
        aria-selected="${isActive}"
        aria-controls="config-group-${key}"
      >
        <span class="config-step-num">${index + 1}</span>
        <img class="config-step-icon" src="${icon}" alt="">
        <span class="config-step-label">${CONFIG_STEP_SHORT[key]}</span>
      </button>
    `;
  }).join('');
}

function updateStepStates() {
  document.querySelectorAll('.config-step').forEach(step => {
    const key = step.dataset.category;
    if (!key) return;
    const isActive = key === activeCategory;
    step.classList.toggle('active', isActive);
    step.classList.toggle('completed', !!selectedConfig[key]);
    step.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}

function renderConfigComponents() {
  const container = document.getElementById('configComponents');
  if (!container) return;

  container.innerHTML = getConfigCategories().map(key => {
    const options = CONFIG_COMPONENTS[key];
    const selected = selectedConfig[key];
    const isOpen = key === activeCategory;
    return `
      <section
        class="config-component-group ${isOpen ? 'open' : ''}"
        id="config-group-${key}"
        data-category="${key}"
      >
        <button type="button" class="config-group-header" aria-expanded="${isOpen}">
          <span class="config-group-title">
            <img class="config-category-icon" src="${CONFIG_CATEGORY_IMAGES[key]}" alt="">
            ${CONFIG_LABELS[key]}
          </span>
          <span class="config-group-selected">${escapeHtml(selected?.name || 'Не выбрано')}</span>
          <i class="fa-solid fa-chevron-down config-group-chevron" aria-hidden="true"></i>
        </button>
        <div class="config-group-body">
          <div class="config-option-grid">
            ${options.map(opt => renderComponentCard(key, opt, selected?.id === opt.id)).join('')}
          </div>
        </div>
      </section>
    `;
  }).join('');
}

function refreshCategoryGrid(category) {
  const group = document.querySelector(`.config-component-group[data-category="${category}"]`);
  if (!group) return;
  const grid = group.querySelector('.config-option-grid');
  if (!grid) return;
  const selected = selectedConfig[category];
  grid.innerHTML = CONFIG_COMPONENTS[category]
    .map(opt => renderComponentCard(category, opt, selected?.id === opt.id))
    .join('');
}

function renderCompatAlert() {
  const alertEl = document.getElementById('configCompatAlert');
  if (!alertEl) return;

  const issues = getConfigCompatibilityIssues(selectedConfig);
  if (!issues.length) {
    alertEl.hidden = true;
    alertEl.innerHTML = '';
    return;
  }

  alertEl.hidden = false;
  alertEl.innerHTML = `
    <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
    <div>
      ${issues.map(msg => `<p>${escapeHtml(msg)}</p>`).join('')}
    </div>
  `;
}

function animatePrice(el, newTotal) {
  if (!el) return;
  if (previousTotal !== newTotal) {
    el.classList.remove('price-flash');
    void el.offsetWidth;
    el.classList.add('price-flash');
  }
  el.textContent = formatPrice(newTotal);
}

function updateSummaryList() {
  const summaryItems = document.getElementById('summaryItems');
  if (!summaryItems) return;

  summaryItems.innerHTML = getConfigCategories().map(key => {
    const comp = selectedConfig[key];
    if (!comp) return '';
    const icon = CONFIG_CATEGORY_IMAGES[key];
    return `
      <button type="button" class="summary-item" data-scroll-category="${key}">
        <span class="summary-item-left">
          <img class="summary-item-icon" src="${icon}" alt="">
          <span class="label">${CONFIG_LABELS[key]}</span>
        </span>
        <span class="value">${escapeHtml(comp.name)}</span>
      </button>
    `;
  }).join('');
}

function updateConfigSummary() {
  const totalEl = document.getElementById('configTotal');
  const totalMobile = document.getElementById('configTotalMobile');
  const progressFill = document.getElementById('configProgressFill');
  const progressText = document.getElementById('configProgressText');

  const categories = getConfigCategories();
  let total = 0;
  const selectedCount = categories.filter(key => selectedConfig[key]).length;
  categories.forEach(key => {
    if (selectedConfig[key]) total += selectedConfig[key].price;
  });

  updateSummaryList();
  animatePrice(totalEl, total);
  animatePrice(totalMobile, total);
  previousTotal = total;

  const pct = Math.round((selectedCount / categories.length) * 100);
  if (progressFill) progressFill.style.width = `${pct}%`;
  if (progressText) progressText.textContent = `${selectedCount}/${categories.length}`;

  renderConfigPreview();
  renderCompatAlert();
}

function updateGroupHeaders() {
  document.querySelectorAll('.config-component-group').forEach(group => {
    const key = group.dataset.category;
    const selected = selectedConfig[key];
    const label = group.querySelector('.config-group-selected');
    if (label && selected) label.textContent = selected.name;
    const isOpen = key === activeCategory;
    group.classList.toggle('open', isOpen);
    const header = group.querySelector('.config-group-header');
    if (header) header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  updateStepStates();
}

function openCategory(category, scrollIntoView = false) {
  if (!getConfigCategories().includes(category)) return;
  activeCategory = category;
  updateGroupHeaders();

  if (scrollIntoView) {
    const group = document.getElementById(`config-group-${category}`);
    group?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function selectComponent(category, id) {
  const comp = CONFIG_COMPONENTS[category]?.find(c => c.id === id);
  if (!comp || selectedConfig[category]?.id === id) return;

  selectedConfig[category] = comp;

  const group = document.querySelector(`.config-component-group[data-category="${category}"]`);
  const label = group?.querySelector('.config-group-selected');
  if (label) label.textContent = comp.name;

  refreshCategoryGrid(category);
  updateConfigSummary();
}

function saveConfigDraft() {
  try {
    localStorage.setItem(CONFIG_DRAFT_KEY, JSON.stringify(
      Object.fromEntries(
        Object.entries(selectedConfig).map(([key, comp]) => [key, comp.id])
      )
    ));
    showToast('Конфигурация сохранена', 'success');
  } catch {
    showToast('Не удалось сохранить конфигурацию', 'error');
  }
}

function loadConfigDraft() {
  try {
    const raw = localStorage.getItem(CONFIG_DRAFT_KEY);
    if (!raw) return false;
    const ids = JSON.parse(raw);
    getConfigCategories().forEach(key => {
      const id = ids[key];
      const comp = CONFIG_COMPONENTS[key]?.find(c => c.id === id);
      if (comp) selectedConfig[key] = comp;
    });
    return true;
  } catch {
    return false;
  }
}

function resetConfig() {
  getConfigCategories().forEach(key => {
    selectedConfig[key] = CONFIG_COMPONENTS[key][0];
  });
  activeCategory = 'cpu';
  renderConfigComponents();
  updateConfigSummary();
  openCategory('cpu', false);
  showToast('Сборка сброшена к начальной конфигурации', 'info');
}

function bindConfiguratorEvents() {
  document.getElementById('configSteps')?.addEventListener('click', (e) => {
    const step = e.target.closest('.config-step');
    if (!step?.dataset.category) return;
    e.preventDefault();
    openCategory(step.dataset.category, true);
  });

  document.getElementById('configComponents')?.addEventListener('click', (e) => {
    const card = e.target.closest('.config-option-card');
    if (card?.dataset.category && card.dataset.id) {
      e.preventDefault();
      selectComponent(card.dataset.category, card.dataset.id);
      return;
    }

    const header = e.target.closest('.config-group-header');
    if (header) {
      e.preventDefault();
      const category = header.closest('.config-component-group')?.dataset.category;
      if (category) openCategory(category, false);
    }
  });

  document.getElementById('summaryItems')?.addEventListener('click', (e) => {
    const row = e.target.closest('[data-scroll-category]');
    if (!row?.dataset.scrollCategory) return;
    e.preventDefault();
    openCategory(row.dataset.scrollCategory, true);
  });
}

function addConfigToCart() {
  const critical = getCriticalCompatibilityIssues(selectedConfig);
  if (critical.length) {
    showToast(critical[0], 'error');
    openCategory('cpu', true);
    return;
  }

  const warnings = getConfigCompatibilityIssues(selectedConfig);
  if (warnings.length) {
    showToast('Есть рекомендации по совместимости — проверьте сборку', 'info');
  }

  const components = Object.entries(selectedConfig)
    .map(([key, comp]) => `${CONFIG_LABELS[key]}: ${comp.name}`)
    .join(', ');
  const total = Object.values(selectedConfig).reduce((sum, c) => sum + c.price, 0);
  addToCart({
    id: 'config-' + Date.now(),
    name: 'Сборка ПК на заказ',
    price: total,
    img: getCasePreviewImg(selectedConfig),
    type: 'config',
    category: 'Индивидуальная сборка',
    description: components,
  });
}

function initConfigurator() {
  selectedConfig = {};
  previousTotal = 0;
  activeCategory = 'cpu';

  getConfigCategories().forEach(key => {
    selectedConfig[key] = CONFIG_COMPONENTS[key][0];
  });

  loadConfigDraft();

  renderConfigSteps();
  renderConfigComponents();
  bindConfiguratorEvents();
  updateConfigSummary();
  openCategory('cpu', false);

  document.getElementById('addConfigToCart')?.addEventListener('click', addConfigToCart);
  document.getElementById('addConfigToCartMobile')?.addEventListener('click', addConfigToCart);
  document.getElementById('saveConfigDraft')?.addEventListener('click', saveConfigDraft);
  document.getElementById('resetConfig')?.addEventListener('click', resetConfig);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('configComponents')) {
    initConfigurator();
  }
});
