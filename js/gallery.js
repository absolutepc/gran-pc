const GALLERY_UI = {
  product: {
    galleryId: 'productGallery',
    mainImgId: 'productDetailMainImg',
    colorNameId: 'selectedColorName',
    pickerClass: 'product-color-picker',
    imageWrapClass: 'product-detail-image-wrap',
    mainImgClass: 'product-detail-main-img',
  },
  readyPc: {
    galleryId: 'pcGallery',
    mainImgId: 'pcDetailMainImg',
    colorNameId: 'pcSelectedColorName',
    pickerClass: 'product-color-picker',
    imageWrapClass: 'product-detail-image-wrap',
    mainImgClass: 'product-detail-main-img',
  },
};

function uniqueGalleryImages(list) {
  const seen = new Set();
  return list.filter(src => {
    if (!src || seen.has(src)) return false;
    seen.add(src);
    return true;
  });
}

function getGalleryInitial(item) {
  const primarySrc = getProductImg(item);
  const firstColor = item.colors?.[0];

  if (firstColor) {
    return {
      src: firstColor.img || primarySrc,
      filter: firstColor.filter && firstColor.filter !== 'none' ? firstColor.filter : '',
      colorName: firstColor.name || '',
    };
  }

  return { src: primarySrc, filter: '', colorName: '' };
}

function isSameGalleryImage(a, b) {
  return normalizeGallerySrc(a) === normalizeGallerySrc(b);
}

function getGalleryItems(item) {
  const images = uniqueGalleryImages((item.images || []).filter(Boolean));
  const hasColorPicker = (item.colors || []).length > 1;

  // Несколько фото — только они в миниатюрах; цвета переключаются отдельным блоком
  if (images.length > 1) {
    return images.map(src => ({ src, filter: '', colorName: '' }));
  }

  // Один снимок и выбор цвета — миниатюры не показываем, чтобы не дублировать picker
  if (hasColorPicker) {
    return [];
  }

  const src = images[0] || getProductImg(item);
  return [{ src, filter: '', colorName: '' }];
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
  const initial = getGalleryInitial(item);
  const initialFilter = initial.filter || item.colors?.[0]?.filter || 'none';
  const filterValue = initialFilter === 'none' ? '' : initialFilter;
  const thumbs = galleryItems.length > 1
    ? `<div class="pc-gallery-thumbs">${galleryItems.map((entry, i) => {
      const isActive = isSameGalleryImage(entry.src, initial.src)
        && (entry.filter || '') === (initial.filter || '');
      return renderGalleryThumb(entry, item.name, i, isActive);
    }).join('')}</div>`
    : '';

  return `
    <div class="pc-detail-gallery" id="${ui.galleryId}">
      <div class="${ui.imageWrapClass}">
        ${item.badge ? `<span class="product-badge ${item.badge}">${BADGE_LABELS[item.badge] || item.badge}</span>` : ''}
        <img
          class="${ui.mainImgClass}"
          id="${ui.mainImgId}"
          src="${initial.src}"
          alt="${escapeHtml(item.name)}"
          style="filter: ${filterValue}"
          onerror="this.src='${DEFAULT_IMG}'"
        >
      </div>
      ${renderItemColorPicker(item, ui)}
      ${thumbs}
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
