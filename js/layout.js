const NAV_ITEMS = [

  { href: 'catalog.html', label: 'Каталог', page: 'catalog' },

  { href: 'ready-pcs.html', label: 'Готовые ПК', page: 'ready-pcs' },

  { href: 'configurator.html', label: 'Конфигуратор', page: 'configurator' },

  { href: 'about.html', label: 'О нас', page: 'about' },

];



function renderHeader(activePage) {

  const navLinks = NAV_ITEMS.map(item =>

    `<a href="${item.href}" class="${item.page === activePage ? 'active' : ''}">${item.label}</a>`

  ).join('');



  return `

    <header class="site-header">

      <div class="container header-inner">

        <a href="index.html" class="logo">

          <div class="logo-icon"><img src="img/hero-pc.svg" alt="PC Market"></div>

          <span>PC Market</span>

        </a>

        <nav class="main-nav" id="mainNav">${navLinks}</nav>

        <div class="header-search">

          <span class="search-icon">🔍</span>

          <input type="text" placeholder="Поиск товаров..." aria-label="Поиск">

        </div>

        <div class="header-actions">

          <a href="account.html" class="header-btn">

            <span>👤</span>

            <span class="account-btn-text">Аккаунт</span>

          </a>

          <a href="cart.html" class="header-btn">

            <span>🛒</span>

            <span>Корзина</span>

            <span class="cart-badge" style="display:none">0</span>

          </a>

        </div>

        <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Меню">☰</button>

      </div>

    </header>

  `;

}



function renderFooter() {

  return `

    <footer class="site-footer">

      <div class="container footer-top">

        <div class="footer-brand">

          <a href="index.html" class="logo">

            <div class="logo-icon"><img src="img/hero-pc.svg" alt="PC Market"></div>

            <span>PC Market</span>

          </a>

          <p>Ваш надёжный партнёр в мире высокопроизводительных компьютеров. Качественные комплектующие, профессиональная сборка и лучшие цены.</p>

          <div class="footer-social">

            <a href="#" aria-label="Telegram" title="Telegram"><i class="fab fa-telegram-plane"></i></a>

            <a href="#" aria-label="VK" title="VKontakte"><i class="fab fa-vk"></i></a>

            <a href="#" aria-label="WhatsApp" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>

            <a href="#" aria-label="Instagram" title="Instagram"><i class="fab fa-instagram"></i></a>

          </div>

        </div>

        <div class="footer-col">

          <h4>Каталог</h4>

          <ul>

            <li><a href="catalog.html?cat=gpu">Видеокарты</a></li>

            <li><a href="catalog.html?cat=cpu">Процессоры</a></li>

            <li><a href="catalog.html?cat=ram">Память</a></li>

            <li><a href="catalog.html?cat=storage">Накопители</a></li>

            <li><a href="catalog.html?cat=monitor">Мониторы</a></li>

          </ul>

        </div>

        <div class="footer-col">

          <h4>Услуги</h4>

          <ul>

            <li><a href="ready-pcs.html">Готовые ПК</a></li>

            <li><a href="configurator.html">Конфигуратор ПК</a></li>

            <li><a href="about.html">О нас</a></li>

            <li><a href="account.html">Личный кабинет</a></li>

            <li><a href="cart.html">Корзина</a></li>

          </ul>

        </div>

        <div class="footer-col">

          <h4>Контакты</h4>

          <ul>

            <li><a href="tel:+74951234567">+7 (495) 123-45-67</a></li>

            <li><a href="mailto:info@pcmarket.ru">info@pcmarket.ru</a></li>

            <li><a href="#">Москва, Технопарк 42</a></li>

            <li><a href="#">Пн–Сб: 10:00–21:00</a></li>

          </ul>

        </div>

      </div>

      <div class="container footer-bottom">

        <p>&copy; 2026 PC Market. Все права защищены.</p>

        <div class="footer-payments">

          <span>Visa</span>

          <span>Mastercard</span>

          <span>Мир</span>

          <span>СБП</span>

        </div>

      </div>

    </footer>

  `;

}



function initLayout(activePage) {

  const headerEl = document.getElementById('site-header');

  const footerEl = document.getElementById('site-footer');

  if (headerEl) headerEl.innerHTML = renderHeader(activePage);

  if (footerEl) footerEl.innerHTML = renderFooter();



  const menuBtn = document.getElementById('mobileMenuBtn');

  const nav = document.getElementById('mainNav');

  if (menuBtn && nav) {

    menuBtn.addEventListener('click', () => nav.classList.toggle('open'));

  }

  if (typeof initPageTransition === 'function') {
    initPageTransition(getPageTransitionLabel(activePage));
  }

}

