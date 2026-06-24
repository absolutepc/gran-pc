const STORE_KEY = 'pcmarket_data_v3';
const CART_KEY = 'pcmarket_cart';
const USER_KEY = 'pcmarket_user';
const ORDERS_KEY = 'pcmarket_orders';
const DEFAULT_IMG = 'img/default.svg';

const CATEGORY_IMAGES = {
  gpu: 'img/categories/gpu.svg',
  cpu: 'img/categories/cpu.svg',
  storage: 'img/categories/storage.svg',
  ram: 'img/categories/ram.svg',
  motherboard: 'img/categories/motherboard.svg',
  psu: 'img/categories/psu.svg',
  cooling: 'img/categories/cooling.svg',
  case: 'img/categories/case.svg',
  peripherals: 'img/categories/peripherals.svg',
  monitor: 'img/categories/monitor.svg',
  'ready-pc': 'img/ready/pc.svg',
  config: 'img/config.svg',
};

const FILTER_SOCKETS = ['AM4', 'AM5', 'LGA1700', 'LGA1851'];
const FILTER_MEMORY_TYPES = ['DDR4', 'DDR5'];
const FILTER_PCIE = ['PCIe 3.0', 'PCIe 4.0', 'PCIe 5.0'];
const FILTER_ATX = ['Mini-ITX', 'Micro-ATX', 'ATX', 'E-ATX'];
const FILTER_RAM = ['8 ГБ', '16 ГБ', '32 ГБ', '64 ГБ'];
const FILTER_LIQUID = ['120 мм', '240 мм', '360 мм'];
const FILTER_PSUTYPE = ['Не модульный', 'Полумодульный', 'Полностью модульный'];
const FILTER_CASEFF = ['Mini-ITX', 'Micro-ATX', 'Mid-Tower', 'Full-Tower', 'E-ATX'];
const FILTER_INCH = ['24"', '27"', '32"', '34"'];
const FILTER_MATRIX = ['IPS', 'VA', 'OLED', 'TN'];
const FILTER_HERTZ = ['60 Гц', '144 Гц', '165 Гц', '240 Гц', '360 Гц'];
const FILTER_QUALITY = ['Full HD', 'QHD', '4K UHD', 'Ultrawide QHD'];
const FILTER_WIRED = ['Проводной', 'Беспроводной', 'Bluetooth'];

const PRODUCT_ATTRIBUTE_FIELDS = [
  'socket', 'memoryType', 'pcie', 'atx', 'ram', 'liquid',
  'psutype', 'caseff', 'inch', 'matrix', 'hertz', 'quality', 'wired',
];

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: 'NVIDIA GeForce RTX 4070 Ti Super', category: 'gpu', price: 89990, oldPrice: 99990, img: 'img/categories/gpu.svg', description: '16 ГБ GDDR6X, DLSS 3, трассировка лучей', badge: 'sale', stock: 15, pcie: 'PCIe 4.0', specs: { vram: '16 ГБ', tdp: '285 Вт' } },
  { id: 'p2', name: 'AMD Ryzen 7 7800X3D', category: 'cpu', price: 42990, img: 'img/categories/cpu.svg', description: '8 ядер, 16 потоков, 3D V-Cache', badge: 'new', stock: 22, socket: 'AM5', memoryType: 'DDR5', specs: { cores: '8' } },
  { id: 'p3', name: 'Samsung 990 Pro 2TB NVMe', category: 'storage', price: 18990, img: 'img/categories/storage.svg', description: 'PCIe 4.0, чтение 7450 МБ/с', stock: 30, pcie: 'PCIe 4.0', specs: { capacity: '2 ТБ', type: 'NVMe' } },
  { id: 'p4', name: 'Corsair Vengeance 32GB DDR5', category: 'ram', price: 12990, img: 'img/categories/ram.svg', description: 'DDR5-6000 CL30, RGB', stock: 45, memoryType: 'DDR5', ram: '32 ГБ', specs: { capacity: '32 ГБ', speed: '6000 МГц' } },
  { id: 'p5', name: 'ASUS ROG Strix B650-E', category: 'motherboard', price: 28990, img: 'img/categories/motherboard.svg', description: 'AM5, PCIe 5.0, WiFi 6E', stock: 12, socket: 'AM5', memoryType: 'DDR5', specs: { formFactor: 'ATX' } },
  { id: 'p6', name: 'be quiet! Dark Power 13 850W', category: 'psu', price: 19990, img: 'img/categories/psu.svg', description: '80+ Titanium, полностью модульный', stock: 18, psutype: 'Полностью модульный', specs: { wattage: '850 Вт', efficiency: 'Titanium' } },
  { id: 'p7', name: 'NZXT Kraken X73 RGB', category: 'cooling', price: 15990, img: 'img/categories/cooling.svg', description: 'СЖО 360 мм, LCD-дисплей', stock: 10, liquid: '360 мм', specs: { type: 'AIO', size: '360 мм' } },
  {
    id: 'p8', name: 'Lian Li O11 Dynamic EVO', category: 'case', price: 16990,
    img: 'img/components/case/D400-B.png',
    description: 'Mid-tower, закалённое стекло', stock: 8, caseff: 'Mid-Tower',
    specs: { formFactor: 'Mid-Tower', color: 'Чёрный' },
    fullDescription: 'Lian Li O11 Dynamic EVO — культовый mid-tower с двойной камерой, панорамным закалённым стеклом и модульной системой крепления радиаторов. Поддерживает E-ATX платы, до 10 вентиляторов и вертикальную установку GPU. Идеален для showcase-сборок с подсветкой.',
    colors: [
      { name: 'Чёрный', hex: '#1a1a1a', img: 'img/components/case/D400-B.png' },
      { name: 'Белый', hex: '#f0f0f0', img: 'img/components/case/D400-W.png' },
    ],
  },
  { id: 'p9', name: 'Logitech G Pro X Superlight 2', category: 'peripherals', price: 14990, img: 'img/categories/peripherals.svg', description: 'Беспроводная игровая мышь, 60 г', stock: 25, wired: 'Беспроводной', specs: { dpi: '32000', weight: '60 г' } },
  { id: 'p10', name: 'Keychron Q1 Pro', category: 'peripherals', price: 19990, img: 'img/categories/peripherals.svg', description: 'Механическая клавиатура, QMK/VIA', badge: 'new', stock: 20, wired: 'Bluetooth', specs: { switches: 'Gateron', layout: '75%' } },
  { id: 'p11', name: 'ASUS ROG Swift PG27AQDM', category: 'monitor', price: 89990, oldPrice: 99990, img: 'img/categories/monitor.svg', description: '27" OLED, 240 Гц, 0.03 мс', badge: 'sale', stock: 5, inch: '27"', matrix: 'OLED', hertz: '240 Гц', quality: 'QHD', specs: { size: '27"', refresh: '240 Гц' } },
  { id: 'p12', name: 'Intel Core i9-14900K', category: 'cpu', price: 54990, img: 'img/categories/cpu.svg', description: '24 ядра, 32 потока, разгон до 6.0 ГГц', stock: 14, socket: 'LGA1700', memoryType: 'DDR5', specs: { cores: '24' } },
  { id: 'p13', name: 'AMD Ryzen 5 5600', category: 'cpu', price: 12990, img: 'img/categories/cpu.svg', description: '6 ядер, 12 потоков, AM4', stock: 35, socket: 'AM4', memoryType: 'DDR4', specs: { cores: '6' } },
  { id: 'p14', name: 'MSI PRO B760M-P DDR4', category: 'motherboard', price: 9990, img: 'img/categories/motherboard.svg', description: 'LGA1700, mATX, 4 слота DDR4', stock: 20, socket: 'LGA1700', memoryType: 'DDR4', specs: { formFactor: 'mATX' } },
  { id: 'p15', name: 'NVIDIA GeForce RTX 4060 Ti', category: 'gpu', price: 44990, img: 'img/categories/gpu.svg', description: '8 ГБ GDDR6, компактная версия', stock: 18, pcie: 'PCIe 4.0', specs: { vram: '8 ГБ', tdp: '160 Вт' } },
  { id: 'p16', name: 'Gigabyte GTX 1660 SUPER', category: 'gpu', price: 15990, img: 'img/categories/gpu.svg', description: '6 ГБ GDDR6, PCIe 3.0', stock: 8, pcie: 'PCIe 3.0', specs: { vram: '6 ГБ', tdp: '125 Вт' } },
  { id: 'p17', name: 'Crucial P3 Plus 1TB NVMe', category: 'storage', price: 5990, img: 'img/categories/storage.svg', description: 'PCIe 4.0, до 5000 МБ/с', stock: 40, pcie: 'PCIe 4.0', specs: { capacity: '1 ТБ', type: 'NVMe' } },
  { id: 'p18', name: 'Kingston NV2 500GB NVMe', category: 'storage', price: 3990, img: 'img/categories/storage.svg', description: 'PCIe 4.0, бюджетный NVMe', stock: 50, pcie: 'PCIe 4.0', specs: { capacity: '500 ГБ', type: 'NVMe' } },
  { id: 'p19', name: 'ASUS ROG Strix Z790-E', category: 'motherboard', price: 38990, img: 'img/categories/motherboard.svg', description: 'LGA1700, DDR5, PCIe 5.0', stock: 10, socket: 'LGA1700', memoryType: 'DDR5', specs: { formFactor: 'ATX' } },
  { id: 'p20', name: 'NVIDIA GeForce RTX 5090', category: 'gpu', price: 249990, img: 'img/categories/gpu.svg', description: '32 ГБ GDDR7, PCIe 5.0', badge: 'new', stock: 3, pcie: 'PCIe 5.0', specs: { vram: '32 ГБ', tdp: '575 Вт' } },
];

const DEFAULT_READY_PCS = [
  {
    id: 'rpc1', name: 'Игровой Зверь Pro', price: 189990, img: 'img/ready/pc.svg', badge: 'sale',
    description: 'Топовый игровой ПК для 4K на максимальных настройках',
    fullDescription: 'Игровой Зверь Pro — флагманская сборка на Ryzen 7 7800X3D и RTX 4080 Super. Ray tracing, DLSS 3 и комфортный 4K Ultra без компромиссов. Идеален для требовательных AAA-проектов и VR.',
    images: ['img/ready/pc.svg'],
    specs: ['RTX 4080 Super', 'Ryzen 7 7800X3D', '32 ГБ DDR5', '2 ТБ NVMe', 'БП 850 Вт'],
    performance: { gaming: 98, work: 85, streaming: 92 },
    components: [
      { type: 'gpu', name: 'NVIDIA RTX 4080 Super 16GB', img: 'img/categories/gpu.svg', description: '16 ГБ GDDR6X — уверенный 4K с ray tracing и DLSS 3.' },
      { type: 'cpu', name: 'AMD Ryzen 7 7800X3D', img: 'img/categories/cpu.svg', description: '8 ядер с 3D V-Cache — лучший игровой процессор AM5.' },
      { type: 'ram', name: '32 ГБ DDR5-6000', img: 'img/categories/ram.svg', description: 'Комплект 2×16 ГБ с оптимальными таймингами для AM5.' },
      { type: 'storage', name: '2 ТБ Samsung 990 Pro', img: 'img/categories/storage.svg', description: 'NVMe Gen4, скорость чтения до 7450 МБ/с.' },
      { type: 'motherboard', name: 'ASUS ROG Strix B650-E', img: 'img/categories/motherboard.svg', description: 'ATX, PCIe 5.0, WiFi 6E, усиленный VRM.' },
      { type: 'psu', name: '850W 80+ Titanium', img: 'img/categories/psu.svg', description: 'be quiet! — тихая и стабильная работа под нагрузкой.' },
      { type: 'cooling', name: '360mm AIO LCD', img: 'img/categories/cooling.svg', description: 'СЖО с LCD-дисплеем для разгона и длительных сессий.' },
      { type: 'case', name: 'Lian Li O11 Dynamic', img: 'img/categories/case.svg', description: 'Премиальный корпус с панорамным стеклом и отличным airflow.' },
    ],
  },
  {
    id: 'rpc2', name: 'Стрим Мастер', price: 149990, img: 'img/ready/pc.svg', badge: 'new',
    description: 'Идеален для стриминга и создания контента',
    fullDescription: 'Стрим Мастер создан для одновременной игры, стриминга и монтажа. 64 ГБ RAM, i7-14700K и RTX 4070 Ti Super с NVENC обеспечивают плавную работу OBS без просадок FPS.',
    images: ['img/ready/pc.svg'],
    specs: ['RTX 4070 Ti Super', 'Intel i7-14700K', '64 ГБ DDR5', '2 ТБ NVMe', 'БП 750 Вт'],
    performance: { gaming: 90, work: 95, streaming: 98 },
    components: [
      { type: 'gpu', name: 'NVIDIA RTX 4070 Ti Super 16GB', img: 'img/categories/gpu.svg', description: '16 ГБ VRAM и аппаратный NVENC для стриминга.' },
      { type: 'cpu', name: 'Intel Core i7-14700K', img: 'img/categories/cpu.svg', description: '20 ядер — игра, OBS и Discord одновременно.' },
      { type: 'ram', name: '64 ГБ DDR5-6000', img: 'img/categories/ram.svg', description: 'Большой объём для монтажа и виртуальных машин.' },
      { type: 'storage', name: '2 ТБ NVMe Gen4', img: 'img/categories/storage.svg', description: 'Место для игр, записей и исходников.' },
      { type: 'motherboard', name: 'ASUS ROG Strix Z790-E', img: 'img/categories/motherboard.svg', description: 'WiFi 6E, 2.5G LAN, мощная подсистема питания.' },
      { type: 'psu', name: '750W 80+ Platinum', img: 'img/categories/psu.svg', description: 'Тихий модульный БП для длительных стримов.' },
      { type: 'cooling', name: '360mm AIO Liquid', img: 'img/categories/cooling.svg', description: 'СЖО 360 мм держит CPU прохладным под нагрузкой.' },
      { type: 'case', name: 'Full-Tower Premium', img: 'img/categories/case.svg', description: 'Просторный корпус с местом для кастомизации.' },
    ],
  },
  {
    id: 'rpc3', name: 'Бюджетный Воин', price: 89990, img: 'img/ready/pc.svg',
    description: 'Отличный 1080p/1440p гейминг без переплаты',
    fullDescription: 'Бюджетный Воин — сбалансированный вход в современный гейминг. Ryzen 5 7600 и RTX 4060 Ti обеспечивают высокий FPS в онлайн-шутерах и комфортную игру в AAA на высоких настройках Full HD.',
    images: ['img/ready/pc.svg'],
    specs: ['RTX 4060 Ti', 'Ryzen 5 7600', '16 ГБ DDR5', '1 ТБ NVMe', 'БП 650 Вт'],
    performance: { gaming: 75, work: 70, streaming: 72 },
    components: [
      { type: 'gpu', name: 'NVIDIA RTX 4060 Ti 8GB', img: 'img/categories/gpu.svg', description: 'Компактная карта с DLSS 3 для 1080p/1440p.' },
      { type: 'cpu', name: 'AMD Ryzen 5 7600', img: 'img/categories/cpu.svg', description: '6 ядер Zen 4 — отличный FPS в играх.' },
      { type: 'ram', name: '16 ГБ DDR5-5600', img: 'img/categories/ram.svg', description: 'Комплект 2×8 ГБ — достаточно для любых игр.' },
      { type: 'storage', name: '1 ТБ NVMe Gen4', img: 'img/categories/storage.svg', description: 'Быстрый SSD до 7000 МБ/с.' },
      { type: 'motherboard', name: 'ASUS B650-Plus', img: 'img/categories/motherboard.svg', description: 'ATX плата AM5 с WiFi 6 и PCIe 4.0.' },
      { type: 'psu', name: '650W 80+ Gold', img: 'img/categories/psu.svg', description: 'Надёжный БП с запасом мощности.' },
      { type: 'cooling', name: 'Башенный кулер', img: 'img/categories/cooling.svg', description: 'Тихое воздушное охлаждение CPU.' },
      { type: 'case', name: 'Mid-Tower RGB', img: 'img/categories/case.svg', description: 'Корпус с tempered glass и подсветкой.' },
    ],
  },
  {
    id: 'rpc4', name: 'Рабочая Станция Elite', price: 249990, img: 'img/ready/pc.svg',
    description: 'Профессиональная станция для 3D, монтажа и AI',
    fullDescription: 'Рабочая Станция Elite — RTX 4090, i9-14900K и 128 ГБ RAM для 3D-моделирования, AI, 8K-монтажа и топового гейминга. Максимум производительности для профессионалов.',
    images: ['img/ready/pc.svg'],
    specs: ['RTX 4090', 'Intel i9-14900K', '128 ГБ DDR5', '4 ТБ NVMe', 'БП 1000 Вт'],
    performance: { gaming: 99, work: 99, streaming: 97 },
    components: [
      { type: 'gpu', name: 'NVIDIA RTX 4090 24GB', img: 'img/categories/gpu.svg', description: '24 ГБ VRAM для CUDA, AI и рендера в 4K.' },
      { type: 'cpu', name: 'Intel Core i9-14900K', img: 'img/categories/cpu.svg', description: '24 ядра для рендера, компиляции и симуляций.' },
      { type: 'ram', name: '128 ГБ DDR5-6000', img: 'img/categories/ram.svg', description: 'Профессиональный объём для тяжёлых проектов.' },
      { type: 'storage', name: '4 ТБ NVMe Gen4', img: 'img/categories/storage.svg', description: 'Огромный быстрый SSD для проектов и медиа.' },
      { type: 'motherboard', name: 'ASUS ROG Maximus Z790 Hero', img: 'img/categories/motherboard.svg', description: 'E-ATX флагман с Thunderbolt 4.' },
      { type: 'psu', name: '1000W 80+ Titanium', img: 'img/categories/psu.svg', description: 'Запас мощности для RTX 4090 и разгона.' },
      { type: 'cooling', name: '360mm AIO LCD', img: 'img/categories/cooling.svg', description: 'Охлаждение для CPU с TDP 253W.' },
      { type: 'case', name: 'Full-Tower Premium', img: 'img/categories/case.svg', description: 'E-ATX корпус с множеством отсеков.' },
    ],
  },
  {
    id: 'rpc5', name: 'Компактный Mini', price: 119990, img: 'img/ready/pc.svg',
    description: 'Мощная SFF-сборка в компактном корпусе',
    fullDescription: 'Компактный Mini — мощность полноразмерного ПК в формате Mini-ITX. RTX 4070 Super и Ryzen 7 7700 помещены в стильный малый корпус без потери производительности.',
    images: ['img/ready/pc.svg'],
    specs: ['RTX 4070 Super', 'Ryzen 7 7700', '32 ГБ DDR5', '1 ТБ NVMe', 'БП 750W SFX'],
    performance: { gaming: 85, work: 80, streaming: 82 },
    components: [
      { type: 'gpu', name: 'NVIDIA RTX 4070 Super 12GB', img: 'img/categories/gpu.svg', description: '12 ГБ VRAM — уверенный 1440p и entry 4K.' },
      { type: 'cpu', name: 'AMD Ryzen 7 7700', img: 'img/categories/cpu.svg', description: '8 ядер Zen 4, энергоэффективность и производительность.' },
      { type: 'ram', name: '32 ГБ DDR5-6000', img: 'img/categories/ram.svg', description: '2×16 ГБ для многозадачности и стриминга.' },
      { type: 'storage', name: '1 ТБ NVMe Gen4', img: 'img/categories/storage.svg', description: 'Высокоскоростной накопитель.' },
      { type: 'motherboard', name: 'ASUS ROG Strix B650-I', img: 'img/categories/motherboard.svg', description: 'Premium Mini-ITX с WiFi 6E.' },
      { type: 'psu', name: '750W SFX 80+ Gold', img: 'img/categories/psu.svg', description: 'Компактный SFX блок питания.' },
      { type: 'cooling', name: '240mm AIO Liquid', img: 'img/categories/cooling.svg', description: 'СЖО 240 мм для SFF-корпуса.' },
      { type: 'case', name: 'Compact Mini-ITX', img: 'img/categories/case.svg', description: 'SFF с панорамным стеклом.' },
    ],
  },
  {
    id: 'rpc6', name: 'Киберспортивный Чемпион', price: 129990, img: 'img/ready/pc.svg', badge: 'new',
    description: 'Оптимизирован для соревновательного гейминга с монитором 360 Гц',
    fullDescription: 'Киберспортивный Чемпион настроен на максимальный FPS и минимальную задержку в CS2, Valorant и других дисциплинах. i5-14600K и RTX 4070 Super дают стабильные сотни кадров в секунду.',
    images: ['img/ready/pc.svg'],
    specs: ['RTX 4070 Super', 'Intel i5-14600K', '32 ГБ DDR5', '1 ТБ NVMe', 'БП 750 Вт'],
    performance: { gaming: 92, work: 75, streaming: 85 },
    components: [
      { type: 'gpu', name: 'NVIDIA RTX 4070 Super 12GB', img: 'img/categories/gpu.svg', description: '240+ FPS в esports при 1080p/1440p.' },
      { type: 'cpu', name: 'Intel Core i5-14600K', img: 'img/categories/cpu.svg', description: '14 ядер, разгон до 5.3 ГГц для esports.' },
      { type: 'ram', name: '32 ГБ DDR5-6000 CL30', img: 'img/categories/ram.svg', description: 'Низкие тайминги для соревновательных игр.' },
      { type: 'storage', name: '1 ТБ NVMe Gen4', img: 'img/categories/storage.svg', description: 'Быстрая загрузка карт и матчей.' },
      { type: 'motherboard', name: 'MSI Z790 Tomahawk', img: 'img/categories/motherboard.svg', description: 'Усиленный VRM для стабильного разгона.' },
      { type: 'psu', name: '750W 80+ Gold', img: 'img/categories/psu.svg', description: 'Модульный тихий БП.' },
      { type: 'cooling', name: '240mm AIO RGB', img: 'img/categories/cooling.svg', description: 'СЖО для длительных турнирных сессий.' },
      { type: 'case', name: 'Mid-Tower RGB', img: 'img/categories/case.svg', description: 'Отличный airflow и RGB-подсветка.' },
    ],
  },
];

const CONFIG_COMPONENTS = {
  cpu: [
    { id: 'c1', name: 'AMD Ryzen 5 7600', price: 22990, specs: '6 ядер / 12 потоков' },
    { id: 'c2', name: 'AMD Ryzen 7 7800X3D', price: 42990, specs: '8 ядер / 16 потоков' },
    { id: 'c3', name: 'Intel Core i5-14600K', price: 28990, specs: '14 ядер / 20 потоков' },
    { id: 'c4', name: 'Intel Core i9-14900K', price: 54990, specs: '24 ядра / 32 потока' },
  ],
  gpu: [
    { id: 'g1', name: 'NVIDIA RTX 4060 Ti', price: 44990, specs: '8 ГБ GDDR6' },
    { id: 'g2', name: 'NVIDIA RTX 4070 Super', price: 64990, specs: '12 ГБ GDDR6X' },
    { id: 'g3', name: 'NVIDIA RTX 4080 Super', price: 109990, specs: '16 ГБ GDDR6X' },
    { id: 'g4', name: 'AMD RX 7900 XTX', price: 89990, specs: '24 ГБ GDDR6' },
  ],
  ram: [
    { id: 'r1', name: '16 ГБ DDR5-5600', price: 6990, specs: 'Комплект 2x8 ГБ' },
    { id: 'r2', name: '32 ГБ DDR5-6000', price: 12990, specs: 'Комплект 2x16 ГБ' },
    { id: 'r3', name: '64 ГБ DDR5-6000', price: 24990, specs: 'Комплект 2x32 ГБ' },
  ],
  storage: [
    { id: 's1', name: '1 ТБ NVMe Gen4', price: 8990, specs: '7000 МБ/с' },
    { id: 's2', name: '2 ТБ NVMe Gen4', price: 15990, specs: '7400 МБ/с' },
    { id: 's3', name: '4 ТБ NVMe Gen4', price: 29990, specs: '7400 МБ/с' },
  ],
  motherboard: [
    { id: 'm1', name: 'ASUS B650-Plus', price: 18990, specs: 'AM5, ATX' },
    { id: 'm2', name: 'MSI Z790 Tomahawk', price: 28990, specs: 'LGA1700, ATX' },
    { id: 'm3', name: 'ASUS X670E Hero', price: 44990, specs: 'AM5, E-ATX' },
  ],
  psu: [
    { id: 'ps1', name: '650W 80+ Gold', price: 8990, specs: 'Полумодульный' },
    { id: 'ps2', name: '850W 80+ Platinum', price: 14990, specs: 'Полностью модульный' },
    { id: 'ps3', name: '1000W 80+ Titanium', price: 22990, specs: 'Полностью модульный' },
  ],
  cooling: [
    { id: 'cl1', name: 'Башенный кулер', price: 4990, specs: 'Два вентилятора' },
    { id: 'cl2', name: 'СЖО 240 мм', price: 9990, specs: 'RGB-помпа' },
    { id: 'cl3', name: 'СЖО 360 мм', price: 14990, specs: 'LCD-дисплей' },
  ],
  case: [
    { id: 'ca1', name: 'Compact Mini-ITX', price: 7990, specs: 'Малый форм-фактор' },
    { id: 'ca2', name: 'Mid-Tower RGB', price: 9990, specs: 'Закалённое стекло' },
    { id: 'ca3', name: 'Full-Tower Premium', price: 16990, specs: 'Двухкамерный' },
  ],
};

const CATEGORY_LABELS = {
  gpu: 'Видеокарты',
  cpu: 'Процессоры',
  storage: 'Накопители',
  ram: 'Память',
  motherboard: 'Материнские платы',
  psu: 'Блоки питания',
  cooling: 'Охлаждение',
  case: 'Корпуса',
  peripherals: 'Периферия',
  monitor: 'Мониторы',
};

const STATUS_LABELS = {
  pending: 'В обработке',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

const BADGE_LABELS = {
  sale: 'Скидка',
  new: 'Новинка',
};

const PERFORMANCE_LABELS = {
  gaming: 'Игры',
  work: 'Работа',
  streaming: 'Стриминг',
};

const COMPONENT_TYPE_LABELS = {
  gpu: 'Видеокарта',
  cpu: 'Процессор',
  ram: 'Оперативная память',
  storage: 'Накопитель',
  motherboard: 'Материнская плата',
  psu: 'Блок питания',
  cooling: 'Охлаждение',
  case: 'Корпус',
};

const PRODUCT_SPEC_LABELS = {
  vram: 'Видеопамять',
  tdp: 'TDP',
  cores: 'Ядра',
  capacity: 'Объём',
  type: 'Тип',
  speed: 'Частота',
  formFactor: 'Форм-фактор',
  wattage: 'Мощность',
  efficiency: 'Эффективность',
  dpi: 'DPI',
  weight: 'Вес',
  switches: 'Переключатели',
  layout: 'Раскладка',
  size: 'Диагональ',
  refresh: 'Частота обновления',
  color: 'Цвет',
};

const ATTRIBUTE_LABELS = {
  socket: 'Сокет',
  memoryType: 'Тип памяти',
  pcie: 'PCI-E',
  atx: 'Форм-фактор',
  ram: 'Объём ОЗУ',
  liquid: 'Размер СЖО',
  psutype: 'Тип БП',
  caseff: 'Форм-фактор корпуса',
  inch: 'Диагональ',
  matrix: 'Матрица',
  hertz: 'Частота',
  quality: 'Разрешение',
  wired: 'Подключение',
};

const DEFAULT_COLOR_SETS = {
  case: [
    { name: 'Чёрный', hex: '#1a1a1a', filter: 'none' },
    { name: 'Белый', hex: '#f0f0f0', filter: 'brightness(1.15)' },
    { name: 'Серый', hex: '#6b7280', filter: 'grayscale(0.35)' },
  ],
  peripherals: [
    { name: 'Чёрный', hex: '#1a1a1a', filter: 'none' },
    { name: 'Белый', hex: '#ffffff', filter: 'brightness(1.2)' },
    { name: 'Розовый', hex: '#ec4899', filter: 'hue-rotate(300deg) saturate(1.2)' },
  ],
  ram: [
    { name: 'Чёрный', hex: '#1a1a1a', filter: 'none' },
    { name: 'Белый', hex: '#f5f5f5', filter: 'brightness(1.1)' },
    { name: 'RGB', hex: '#8b5cf6', filter: 'hue-rotate(45deg) saturate(1.3)' },
  ],
  default: [
    { name: 'Чёрный', hex: '#1a1a1a', filter: 'none' },
    { name: 'Серебристый', hex: '#c0c0c0', filter: 'grayscale(0.25) brightness(1.05)' },
    { name: 'Белый', hex: '#f5f5f5', filter: 'brightness(1.15)' },
  ],
};

const ADMIN_CREDENTIALS = { email: 'admin@pcmarket.ru', password: 'admin123' };

function getProductImg(item) {
  if (item.img) return item.img;
  if (item.category && CATEGORY_IMAGES[item.category]) return CATEGORY_IMAGES[item.category];
  return DEFAULT_IMG;
}

function renderProductImg(img, alt = '') {
  const src = img || DEFAULT_IMG;
  const safeAlt = alt.replace(/"/g, '&quot;');
  return `<img src="${src}" alt="${safeAlt}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'">`;
}

function initStore() {
  if (!localStorage.getItem(STORE_KEY)) {
    localStorage.setItem(STORE_KEY, JSON.stringify({ products: DEFAULT_PRODUCTS, readyPCs: DEFAULT_READY_PCS }));
  }
  if (!localStorage.getItem(CART_KEY)) {
    localStorage.setItem(CART_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(ORDERS_KEY)) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }
}

function mergeDefaultAttributes(products) {
  const defaultsById = Object.fromEntries(DEFAULT_PRODUCTS.map(p => [p.id, p]));
  return products.map(product => enrichProduct(product, defaultsById[product.id]));
}

function buildFullDescription(product) {
  if (product.fullDescription) return product.fullDescription;
  const cat = (CATEGORY_LABELS[product.category] || product.category).toLowerCase();
  const attrs = PRODUCT_ATTRIBUTE_FIELDS
    .filter(f => product[f])
    .map(f => `${ATTRIBUTE_LABELS[f]}: ${product[f]}`)
    .join(', ');
  const specsText = product.specs && typeof product.specs === 'object' && !Array.isArray(product.specs)
    ? Object.entries(product.specs).map(([k, v]) => `${PRODUCT_SPEC_LABELS[k] || k}: ${v}`).join(', ')
    : '';
  const parts = [
    `${product.name} — ${cat} от PC Market.`,
    product.description || '',
    attrs,
    specsText,
    'Гарантия 24 месяца. Бесплатная консультация по совместимости с вашей сборкой.',
  ].filter(Boolean);
  return parts.join(' ');
}

function buildDefaultColors(product) {
  const baseImg = getProductImg(product);
  const set = DEFAULT_COLOR_SETS[product.category] || DEFAULT_COLOR_SETS.default;
  return set.map(c => ({ ...c, img: c.img || baseImg }));
}

function enrichProduct(product, def) {
  const merged = def ? { ...def, ...product } : { ...product };
  merged.fullDescription = buildFullDescription(merged);
  merged.colors = (merged.colors?.length ? merged.colors : buildDefaultColors(merged))
    .map(c => ({ ...c, img: c.img || getProductImg(merged) }));
  PRODUCT_ATTRIBUTE_FIELDS.forEach(field => {
    if (merged[field] == null && def?.[field] != null) merged[field] = def[field];
  });
  if (!merged.specs && def?.specs) merged.specs = def.specs;
  return merged;
}

function getProducts() {
  initStore();
  const data = JSON.parse(localStorage.getItem(STORE_KEY));
  const products = Array.isArray(data?.products) ? data.products : DEFAULT_PRODUCTS;
  return mergeDefaultAttributes(products);
}

function getEnrichedProductById(id) {
  const products = getProducts();
  return products.find(p => p.id === id) || null;
}

function enrichReadyPC(pc) {
  if (!pc) return null;
  const tmpl = DEFAULT_READY_PCS.find(d => d.id === pc.id);
  const merged = tmpl ? { ...tmpl, ...pc } : { ...pc };
  return {
    ...merged,
    fullDescription: merged.fullDescription || merged.description || '',
    images: Array.isArray(merged.images) && merged.images.length
      ? merged.images
      : [merged.img || 'img/ready/pc.svg'],
    components: Array.isArray(merged.components) ? merged.components : [],
    specs: merged.specs || [],
  };
}

function getReadyPCs() {
  initStore();
  const data = JSON.parse(localStorage.getItem(STORE_KEY));
  const pcs = Array.isArray(data.readyPCs) ? data.readyPCs : [];
  const list = !pcs.length ? DEFAULT_READY_PCS.map(enrichReadyPC) : pcs.map(enrichReadyPC);
  return list.sort((a, b) => a.price - b.price);
}

function getReadyPCById(id) {
  return getReadyPCs().find(p => p.id === id) || null;
}

function saveProducts(products) {
  const data = JSON.parse(localStorage.getItem(STORE_KEY));
  data.products = products;
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function saveReadyPCs(pcs) {
  const data = JSON.parse(localStorage.getItem(STORE_KEY));
  data.readyPCs = pcs;
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);
}

function getProductById(id) {
  return getEnrichedProductById(id) || getReadyPCs().find(p => p.id === id);
}

function matchesAttributeFilter(product, field, selected) {
  if (!selected.length) return true;
  if (!product[field]) return false;
  return selected.includes(product[field]);
}

function getAvailableFilterValues(products, field, predefined) {
  const fromProducts = new Set(products.map(p => p[field]).filter(Boolean));
  return predefined.filter(v => fromProducts.has(v));
}

initStore();
