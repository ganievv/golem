// ─── Telegram Mini App init ───
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

function tgAlert(msg, cb) {
  if (tg?.showAlert) tg.showAlert(msg, cb);
  else { alert(msg); cb?.(); }
}

function tgConfirm(msg, cb) {
  if (tg?.showConfirm) tg.showConfirm(msg, ok => { if (ok) cb(); });
  else { if (confirm(msg)) cb(); }
}

function haptic(type) {
  if (!tg?.HapticFeedback) return;
  if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
  else tg.HapticFeedback.impactOccurred(type);
}

// ─── Menu data ───
const MENU = {
  "KAFFEE & TEE": [
    { name: "Espresso", price: 2.50 },
    { name: "Kaffee", price: 3.00 },
    { name: "Milchkaffee", price: 3.50 },
    { name: "Cappuccino", price: 3.50 },
    { name: "Latte Macchiato", price: 3.50 },
    { name: "Latte Freddo", price: 3.50 },
    { name: "Iced Americano", price: 3.50 },
    { name: "Schoki / Chai", price: 3.50 },
    { name: "Tee", price: 3.50 },
    { name: "Soja- / Hafermilch / Sirup", price: 0.50, addon: true },
  ],
  "SOFTDRINKS": [
    { name: "Wasser offen", volume: "0.25л", price: 3.00 },
    { name: "Wasser Flasche", volume: "0.50л", price: 4.50 },
    { name: "Saftschorle", volume: "0.25л", price: 3.50 },
    { name: "Saft", volume: "0.25л", price: 3.50 },
    { name: "Cola / Fanta (+/- Zucker)", volume: "0.33л", price: 3.50 },
    { name: "Ginger Ale", volume: "0.20л", price: 3.50 },
    { name: "Bitterlemon", volume: "0.20л", price: 3.50 },
    { name: "Orangina (Rot/Gelb)", volume: "0.25л", price: 3.50 },
    { name: "Bionade", volume: "0.33л", price: 3.50 },
    { name: "Almdudler", volume: "0.33л", price: 4.00 },
    { name: "Eistee", volume: "0.33л", price: 4.00 },
    { name: "Red Bull", volume: "0.25л", price: 4.50 },
  ],
  "WEIN & SEKT": [
    { name: "Weinschorle", volume: "0.25л", price: 4.50 },
    { name: "Wein", volume: "0.25л", price: 6.00 },
    { name: "Sekt auf Eis", volume: "0.20л", price: 6.00 },
  ],
  "BIER": [
    { name: "Waldhaus", volume: "0.33л", price: 3.50 },
    { name: "Beck's", volume: "0.33л", price: 3.50 },
    { name: "Beck's alkoholfrei", volume: "0.33л", price: 3.50 },
    { name: "Donauradler", volume: "0.33л", price: 3.50 },
    { name: "Naturtrübes Hefeweizen", volume: "0.50л", price: 4.50 },
    { name: "Leichtes Hefeweizen", volume: "0.50л", price: 4.50 },
    { name: "Hefeweizen alkoholfrei", volume: "0.50л", price: 4.50 },
    { name: "Kristallweizen", volume: "0.50л", price: 4.50 },
    { name: "Weizenmischgetränk", volume: "0.50л", price: 4.50 },
    { name: "Hirsch Helles", volume: "0.50л", price: 4.50 },
    { name: "Zwickel", volume: "0.50л", price: 4.50 },
    { name: "Desperados", volume: "0.33л", price: 5.00 },
  ],
  "LONGDRINKS": [
    { name: "Sommerschorle", volume: "0.25л", price: 7.50 },
    { name: "Aperol Spritz", volume: "0.25л", price: 7.50 },
    { name: "Limoncello Spritz", volume: "0.25л", price: 7.50 },
    { name: "Hugo", volume: "0.25л", price: 7.50 },
    { name: "Lillet Berry", volume: "0.25л", price: 7.50 },
    { name: "Cuba Libre", volume: "0.25л", price: 7.50 },
    { name: "Wodka Bull", volume: "0.25л", price: 7.50 },
    { name: "Gin Tonic", volume: "0.25л", price: 7.50 },
    { name: "Whisky Cola", volume: "0.25л", price: 7.50 },
  ],
  "APERITIF": [
    { name: "Kurze", volume: "0.02л", price: 2.50 },
    { name: "Martini", volume: "0.06л", price: 4.50 },
    { name: "Ramazotti / Baileys", volume: "0.06л", price: 4.50 },
  ],
};

// Flat list for index-based lookup (safe for special chars in names)
const allItems = [];
Object.entries(MENU).forEach(([category, items]) => {
  items.forEach(item => allItems.push({ ...item, category }));
});

// ─── State ───
let currentOrder = { table: '', customer: '', items: [] };
let savedOrders = [];

function loadSaved() {
  try { savedOrders = JSON.parse(localStorage.getItem('bar_saved_orders') || '[]'); }
  catch { savedOrders = []; }
}

function persistSaved() {
  localStorage.setItem('bar_saved_orders', JSON.stringify(savedOrders));
}

// ─── DOM refs ───
const $ = id => document.getElementById(id);
const menuList       = $('menu-list');
const searchInput    = $('search');
const searchClear    = $('search-clear');
const tableInput     = $('table-number');
const customerInput  = $('customer-name');
const orderItemsEl   = $('order-items');
const orderFooter    = $('order-footer');
const totalPriceEl   = $('total-price');
const orderBadge     = $('order-badge');
const ordersBadge    = $('orders-badge');
const savedList      = $('saved-orders-list');
const ordersToolbar  = $('orders-toolbar');
const ordersCount    = $('orders-count-label');

// ─── Helpers ───
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Menu ───
function renderMenu(query = '') {
  menuList.innerHTML = '';
  const q = query.trim().toLowerCase();
  let hasAny = false;

  for (const [category, items] of Object.entries(MENU)) {
    const list = q ? items.filter(i => i.name.toLowerCase().includes(q)) : items;
    if (!list.length) continue;
    hasAny = true;

    const header = document.createElement('div');
    header.className = 'category-header';
    header.textContent = category;
    menuList.appendChild(header);

    list.forEach(item => {
      const idx = allItems.findIndex(i => i.name === item.name && i.category === category);
      const div = document.createElement('div');
      div.className = 'menu-item' + (item.addon ? ' menu-item-addon' : '');
      const priceStr = item.addon ? `+${item.price.toFixed(2)}€` : `${item.price.toFixed(2)}€`;
      div.innerHTML = `
        <div class="menu-item-info">
          <div class="menu-item-name">${esc(item.name)}</div>
          ${item.volume ? `<div class="menu-item-meta">${item.volume}</div>` : ''}
        </div>
        <div class="menu-item-price">${priceStr}</div>
        <button class="btn-add" data-idx="${idx}" aria-label="Добавить">+</button>
      `;
      menuList.appendChild(div);
    });
  }

  if (!hasAny) {
    menuList.innerHTML = `<div class="no-results">Ничего не найдено 🔍</div>`;
  }
}

// ─── Add to order ───
function addToOrder(idx) {
  const item = allItems[idx];
  if (!item) return;
  const found = currentOrder.items.find(i => i.name === item.name);
  if (found) {
    found.qty++;
  } else {
    currentOrder.items.push({
      name: item.name,
      price: item.price,
      volume: item.volume || '',
      qty: 1,
    });
  }
  renderOrder();
  updateBadges();
  haptic('light');
}

function changeQty(name, delta) {
  const item = currentOrder.items.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    currentOrder.items = currentOrder.items.filter(i => i.name !== name);
  }
  renderOrder();
  updateBadges();
}

function removeItem(name) {
  currentOrder.items = currentOrder.items.filter(i => i.name !== name);
  renderOrder();
  updateBadges();
  haptic('medium');
}

function clearCurrentOrder() {
  if (!currentOrder.items.length) return;
  tgConfirm('Очистить текущий заказ?', () => {
    currentOrder.items = [];
    renderOrder();
    updateBadges();
  });
}

function getTotal(items) {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}

// ─── Render current order ───
function renderOrder() {
  orderItemsEl.innerHTML = '';

  if (!currentOrder.items.length) {
    orderFooter.style.display = 'none';
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-icon">🍺</div>
      <div class="empty-title">Заказ пустой</div>
      <div class="empty-sub">Добавьте напитки из вкладки Меню</div>
    `;
    orderItemsEl.appendChild(empty);
    return;
  }

  orderFooter.style.display = 'block';

  currentOrder.items.forEach(item => {
    const lineTotal = item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'order-item';
    div.innerHTML = `
      <div class="order-item-info">
        <div class="order-item-name">${esc(item.name)}</div>
        ${item.volume ? `<div class="order-item-vol">${item.volume}</div>` : ''}
      </div>
      <div class="qty-control">
        <button class="qty-btn" data-action="dec" data-name="${esc(item.name)}">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-name="${esc(item.name)}">+</button>
      </div>
      <div class="order-item-price">${lineTotal.toFixed(2)}€</div>
      <button class="btn-remove" data-action="remove" data-name="${esc(item.name)}">✕</button>
    `;
    orderItemsEl.appendChild(div);
  });

  totalPriceEl.textContent = `${getTotal(currentOrder.items).toFixed(2)}€`;
}

// ─── Save order ───
function saveOrder() {
  if (!currentOrder.items.length) {
    tgAlert('Заказ пустой — добавьте напитки.');
    return;
  }

  const now = new Date();
  const dateStr = now.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const order = {
    id: Date.now(),
    table: tableInput.value.trim() || '—',
    customer: customerInput.value.trim() || '',
    items: currentOrder.items.map(i => ({ ...i })),
    total: getTotal(currentOrder.items),
    createdAt: dateStr,
  };

  savedOrders.unshift(order);
  persistSaved();

  currentOrder.items = [];
  tableInput.value = '';
  customerInput.value = '';
  renderOrder();
  updateBadges();
  renderSavedOrders();

  switchTab('orders');
  haptic('success');
}

// ─── Saved orders ───
function deleteSavedOrder(id) {
  tgConfirm('Удалить этот заказ?', () => {
    savedOrders = savedOrders.filter(o => o.id !== id);
    persistSaved();
    renderSavedOrders();
    updateBadges();
  });
}

function clearAllOrders() {
  if (!savedOrders.length) return;
  tgConfirm('Удалить все сохранённые заказы?', () => {
    savedOrders = [];
    persistSaved();
    renderSavedOrders();
    updateBadges();
  });
}

function renderSavedOrders() {
  savedList.innerHTML = '';

  if (!savedOrders.length) {
    ordersToolbar.style.display = 'none';
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-icon">📋</div>
      <div class="empty-title">Нет сохранённых заказов</div>
      <div class="empty-sub">Сохранённые заказы появятся здесь</div>
    `;
    savedList.appendChild(empty);
    return;
  }

  ordersToolbar.style.display = 'flex';
  ordersCount.textContent = `${savedOrders.length} ${pluralOrders(savedOrders.length)}`;

  savedOrders.forEach(order => {
    const parts = [];
    if (order.table !== '—') parts.push(`Стол ${order.table}`);
    if (order.customer) parts.push(order.customer);
    const title = parts.length ? parts.join(' · ') : 'Заказ';

    const itemsHtml = order.items.map(item => `
      <div class="saved-order-row">
        <span class="saved-order-row-name">${esc(item.name)}</span>
        <span class="saved-order-row-qty">× ${item.qty}</span>
        <span class="saved-order-row-price">${(item.price * item.qty).toFixed(2)}€</span>
      </div>
    `).join('');

    const card = document.createElement('div');
    card.className = 'saved-order-card';
    card.innerHTML = `
      <div class="saved-order-top">
        <div>
          <div class="saved-order-title">${esc(title)}</div>
          <div class="saved-order-date">${order.createdAt}</div>
        </div>
        <button class="btn-delete-order" data-id="${order.id}">Удалить</button>
      </div>
      <div class="saved-order-items">${itemsHtml}</div>
      <div class="saved-order-bottom">
        <span class="saved-order-total">Итого: ${order.total.toFixed(2)}€</span>
      </div>
    `;
    savedList.appendChild(card);
  });
}

function pluralOrders(n) {
  if (n % 10 === 1 && n % 100 !== 11) return 'заказ';
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return 'заказа';
  return 'заказов';
}

// ─── Badges ───
function updateBadges() {
  const itemCount = currentOrder.items.reduce((s, i) => s + i.qty, 0);
  orderBadge.style.display  = itemCount > 0 ? 'flex' : 'none';
  orderBadge.textContent    = itemCount > 99 ? '99+' : itemCount;

  ordersBadge.style.display = savedOrders.length > 0 ? 'flex' : 'none';
  ordersBadge.textContent   = savedOrders.length > 99 ? '99+' : savedOrders.length;
}

// ─── Tab switching ───
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  $(`tab-${name}`).classList.add('active');
  document.querySelector(`.nav-btn[data-tab="${name}"]`).classList.add('active');
}

// ─── Event listeners ───
menuList.addEventListener('click', e => {
  const btn = e.target.closest('.btn-add');
  if (btn) addToOrder(+btn.dataset.idx);
});

orderItemsEl.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const { action, name } = btn.dataset;
  if (action === 'inc')    changeQty(name, +1);
  if (action === 'dec')    changeQty(name, -1);
  if (action === 'remove') removeItem(name);
});

savedList.addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete-order');
  if (btn) deleteSavedOrder(+btn.dataset.id);
});

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value;
  searchClear.style.display = q ? 'flex' : 'none';
  renderMenu(q);
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.style.display = 'none';
  renderMenu();
  searchInput.focus();
});

$('save-order-btn').addEventListener('click', saveOrder);
$('clear-order-btn').addEventListener('click', clearCurrentOrder);
$('clear-all-orders-btn').addEventListener('click', clearAllOrders);

// ─── Init ───
loadSaved();
renderMenu();
renderOrder();
renderSavedOrders();
updateBadges();
