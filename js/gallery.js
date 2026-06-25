const GALLERY_UI = {
  product: {
    galleryId: 'productGallery',
    mainImgId: 'productDetailMainImg',
    colorNameId: 'selectedColorName',
    pickerClass: 'product-color-picker',
    imageWrapClass: 'product-detail-image-wrap',
  },
  readyPc: {
    galleryId: 'pcGallery',
    mainImgId: 'pcDetailMainImg',
    colorNameId: 'pcSelectedColorName',
    pickerClass: 'pc-color-picker',
    imageWrapClass: 'pc-detail-image-wrap',
  },
};

function getGalleryItems(item) {
  const entries = [];
  const seen = new Set();

  function addEntry(src, filter = '', colorName = '') {
    const key = `${src}|${filter}|${colorName}`;
    if (!src || seen.has(key)) return;
    seen.add(key);
    entries.push({ src, filter, colorName });
  }

  (item.images || []).forEach(src => addEntry(src, '', ''));
  (item.colors || []).forEach(color => {
    addEntry(
      color.img || getProductImg(item),
      color.filter && color.filter !== 'none' ? color.filter : '',
      color.name || ''
    );
  });

  if (!entries.length) {
    addEntry(getProductImg(item), '', '');
  }

  return entries;
}

function renderGalleryThumb(item, itemName, index, isActive) {
  const filterStyle = item.filter ? `filter:${item.filter};` : '';
  const safeName = escapeHtml(itemName);
  const safeSrc = escapeHtml(item.src);
  const safeColorName = escapeHtml(item.colorName);
  const safeFilter = escapeHtml(item.filter || '');
  return `
    <button
      type="button"
      class="pc-gallery-thumb ${isActive ? 'active' : ''}"
      data-src="${safeSrc}"
      data-filter="${safeFilter}"
      data-color-name="${safeColorName}"
      aria-label="Фото ${index + 1}${item.colorName ? `: ${item.colorName}` : ''}"
    >
      <img
        src="${item.src}"
        alt="${safeName}"
        style="${filterStyle}"
        loading="lazy"
        onerror="this.src='${DEFAULT_IMG}'"
      >
    </button>
  `;
}

function renderItemColorPicker(item, ui) {
  const colors = item.colors || [];
  if (!colors.length) return '';

  const initial = colors[0];
  return `
    <div class="${ui.pickerClass}" data-item-id="${escapeHtml(item.id)}">
      <span class="color-picker-label">Цвет: <strong id="${ui.colorNameId}">${escapeHtml(initial.name)}</strong></span>
      <div class="color-picker-btns">
        ${colors.map((color, i) => `
          <button
            type="button"
            class="color-btn ${i === 0 ? 'active' : ''}"
            data-index="${i}"
            data-name="${escapeHtml(color.name)}"
            data-img="${color.img || getProductImg(item)}"
            data-filter="${escapeHtml(color.filter || 'none')}"
            style="--swatch: ${color.hex}"
            title="${escapeHtml(color.name)}"
            aria-label="Цвет: ${escapeHtml(color.name)}"
          ></button>
        `).join('')}
      </div>
    </div>
  `;
}

function renderItemGallery(item, ui) {
  const galleryItems = getGalleryItems(item);
  const initial = galleryItems[0];
  const initialFilter = initial.filter || item.colors?.[0]?.filter || 'none';
  const filterValue = initialFilter === 'none' ? '' : initialFilter;
  const thumbs = galleryItems.length > 1
    ? `<div class="pc-gallery-thumbs">${galleryItems.map((entry, i) => renderGalleryThumb(entry, item.name, i, i === 0)).join('')}</div>`
    : '';

  return `
    <div class="pc-detail-gallery" id="${ui.galleryId}">
      <div class="${ui.imageWrapClass}">
        ${item.badge ? `<span class="product-badge ${item.badge}">${BADGE_LABELS[item.badge] || item.badge}</span>` : ''}
        <img
          class="pc-detail-main-img"
          id="${ui.mainImgId}"
          src="${initial.src}"
          alt="${escapeHtml(item.name)}"
          style="filter: ${filterValue}"
          onerror="this.src='${DEFAULT_IMG}'"
        >
      </div>
      ${thumbs}
      ${renderItemColorPicker(item, ui)}
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

function setGalleryMainImage(container, src, filter, colorName, ui) {
  const main = container.querySelector(`#${ui.mainImgId}`);
  if (!main) return;
  const normalizedSrc = normalizeGallerySrc(src);
  main.src = normalizedSrc;
  main.style.filter = filter;

  container.querySelectorAll('.pc-gallery-thumb').forEach(btn => {
    const matchesSrc = normalizeGallerySrc(btn.dataset.src) === normalizedSrc;
    const matchesFilter = (btn.dataset.filter || '') === (filter || '');
    btn.classList.toggle('active', matchesSrc && matchesFilter);
  });

  syncColorPickerWithGalleryImage(container, normalizedSrc, colorName, ui);
}

function syncColorPickerWithGalleryImage(container, src, preferredColorName, ui) {
  const picker = container.querySelector(`.${ui.pickerClass}`);
  if (!picker) return;
  const colorNameEl = container.querySelector(`#${ui.colorNameId}`);
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

function bindItemGallery(container, ui) {
  const gallery = container.querySelector(`#${ui.galleryId}`);
  if (!gallery) return;

  gallery.addEventListener('click', (event) => {
    const btn = event.target.closest('.pc-gallery-thumb');
    if (!btn || !gallery.contains(btn)) return;
    event.preventDefault();
    setGalleryMainImage(container, btn.dataset.src, btn.dataset.filter || '', btn.dataset.colorName || '', ui);
  });
}

function bindItemColorPicker(container, ui) {
  const picker = container.querySelector(`.${ui.pickerClass}`);
  if (!picker) return;

  picker.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      picker.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const colorNameEl = container.querySelector(`#${ui.colorNameId}`);
      if (colorNameEl) colorNameEl.textContent = btn.dataset.name;

      const filter = btn.dataset.filter === 'none' ? '' : (btn.dataset.filter || '');
      setGalleryMainImage(container, btn.dataset.img, filter, btn.dataset.name, ui);
    });
  });
}

function bindItemGalleryAndColor(container, ui) {
  bindItemGallery(container, ui);
  bindItemColorPicker(container, ui);
}
