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

let selectedConfig = {};

function initConfigurator() {
  selectedConfig = {};
  const container = document.getElementById('configComponents');
  if (!container) return;

  container.innerHTML = Object.entries(CONFIG_COMPONENTS).map(([key, options]) => `
    <div class="config-component-group" data-category="${key}">
      <h3><img class="config-category-icon" src="${CONFIG_CATEGORY_IMAGES[key] || DEFAULT_IMG}" alt=""> ${CONFIG_LABELS[key]}</h3>
      <div class="component-options">
        ${options.map((opt, i) => `
          <label class="component-option ${i === 0 ? 'selected' : ''}" data-category="${key}" data-id="${opt.id}">
            <input type="radio" name="${key}" value="${opt.id}" ${i === 0 ? 'checked' : ''}>
            <div class="component-option-info">
              <div class="name">${opt.name}</div>
              <div class="specs">${opt.specs}</div>
            </div>
            <div class="price">${formatPrice(opt.price)}</div>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  Object.keys(CONFIG_COMPONENTS).forEach(key => {
    selectedConfig[key] = CONFIG_COMPONENTS[key][0];
  });

  container.querySelectorAll('.component-option').forEach(option => {
    option.addEventListener('click', () => {
      const category = option.dataset.category;
      const id = option.dataset.id;
      option.closest('.component-options').querySelectorAll('.component-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      option.querySelector('input').checked = true;
      selectedConfig[category] = CONFIG_COMPONENTS[category].find(c => c.id === id);
      updateConfigSummary();
    });
  });

  updateConfigSummary();
  updateConfigSteps();
}

function updateConfigSummary() {
  const summaryItems = document.getElementById('summaryItems');
  const totalEl = document.getElementById('configTotal');
  if (!summaryItems || !totalEl) return;

  let total = 0;
  summaryItems.innerHTML = Object.entries(selectedConfig).map(([key, comp]) => {
    total += comp.price;
    return `
      <div class="summary-item">
        <span class="label">${CONFIG_LABELS[key]}</span>
        <span class="value">${comp.name}</span>
      </div>
    `;
  }).join('');

  totalEl.textContent = formatPrice(total);
}

function updateConfigSteps() {
  const steps = document.querySelectorAll('.config-step');
  steps.forEach((step, i) => {
    step.classList.remove('active', 'completed');
    const category = Object.keys(CONFIG_COMPONENTS)[i];
    if (selectedConfig[category]) step.classList.add('completed');
  });
  if (steps[0]) steps[0].classList.add('active');
}

function addConfigToCart() {
  const components = Object.entries(selectedConfig).map(([key, comp]) => `${CONFIG_LABELS[key]}: ${comp.name}`).join(', ');
  const total = Object.values(selectedConfig).reduce((sum, c) => sum + c.price, 0);
  addToCart({
    id: 'config-' + Date.now(),
    name: 'Сборка ПК на заказ',
    price: total,
    img: 'img/config.svg',
    type: 'config',
    category: 'Индивидуальная сборка',
    description: components,
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('configComponents')) {
    initConfigurator();
    const addBtn = document.getElementById('addConfigToCart');
    if (addBtn) addBtn.addEventListener('click', addConfigToCart);
  }
});
