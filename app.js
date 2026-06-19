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

// ─── i18n ───
const TRANSLATIONS = {
  ru: {
    nav_menu:            'Меню',
    nav_order:           'Заказ',
    nav_orders:          'Заказы',
    search_ph:           'Поиск напитка...',
    label_table:         'Столик',
    ph_table:            'Номер',
    label_name:          'Имя',
    ph_name:             'Необязательно',
    editing:             'Редактирование',
    btn_cancel:          'Отмена',
    total:               'Итого',
    btn_clear:           'Очистить',
    btn_save:            '💾 Сохранить заказ',
    btn_update:          '✏️ Обновить заказ',
    empty_order_title:   'Заказ пустой',
    empty_order_sub:     'Добавьте напитки из вкладки Меню',
    empty_orders_title:  'Нет сохранённых заказов',
    empty_orders_sub:    'Сохранённые заказы появятся здесь',
    no_results:          'Ничего не найдено 🔍',
    btn_clear_all:       'Удалить все',
    table_prefix:        'Стол',
    order_word:          'Заказ',
    btn_delete:          'Удалить',
    btn_edit:            '✏️ Редактировать',
    edited:              'изм.',
    total_colon:         'Итого:',
    grand_orders:        'Все заказы',
    grand_tips:          'Чаевые',
    grand_export:        'Экспорт заказов',
    pay_gave:            'Гость дал',
    pay_pays:            'Платит',
    pay_tip:             'Чаевые',
    pay_change:          'Сдача',
    pay_no_tip:          'Чаевых нет',
    pay_shortage:        'Не хватает',
    pay_warn:            '⚠️ Дал меньше чем платит',
    confirm_clear:       'Очистить текущий заказ?',
    alert_empty:         'Заказ пустой — добавьте напитки.',
    confirm_delete:      'Удалить этот заказ?',
    confirm_clear_all:   'Удалить все сохранённые заказы?',
    confirm_cancel_edit: 'Отменить редактирование? Изменения не сохранятся.',
    orders_count: n => {
      if (n % 10 === 1 && n % 100 !== 11) return `${n} заказ`;
      if ([2,3,4].includes(n % 10) && ![12,13,14].includes(n % 100)) return `${n} заказа`;
      return `${n} заказов`;
    },
  },
  de: {
    nav_menu:            'Menü',
    nav_order:           'Bestellung',
    nav_orders:          'Bestellungen',
    search_ph:           'Getränk suchen...',
    label_table:         'Tisch',
    ph_table:            'Nummer',
    label_name:          'Name',
    ph_name:             'Optional',
    editing:             'Bearbeitung',
    btn_cancel:          'Abbrechen',
    total:               'Gesamt',
    btn_clear:           'Leeren',
    btn_save:            '💾 Bestellung speichern',
    btn_update:          '✏️ Bestellung aktualisieren',
    empty_order_title:   'Bestellung leer',
    empty_order_sub:     'Getränke aus dem Menü hinzufügen',
    empty_orders_title:  'Keine gespeicherten Bestellungen',
    empty_orders_sub:    'Gespeicherte Bestellungen erscheinen hier',
    no_results:          'Nichts gefunden 🔍',
    btn_clear_all:       'Alle löschen',
    table_prefix:        'Tisch',
    order_word:          'Bestellung',
    btn_delete:          'Löschen',
    btn_edit:            '✏️ Bearbeiten',
    edited:              'geä.',
    total_colon:         'Gesamt:',
    grand_orders:        'Alle Bestellungen',
    grand_tips:          'Trinkgeld',
    grand_export:        'Bestellungen exportieren',
    pay_gave:            'Gegeben',
    pay_pays:            'Zahlt',
    pay_tip:             'Trinkgeld',
    pay_change:          'Rückgeld',
    pay_no_tip:          'Kein Trinkgeld',
    pay_shortage:        'Fehlbetrag',
    pay_warn:            '⚠️ Weniger gegeben als zu zahlen',
    confirm_clear:       'Aktuelle Bestellung leeren?',
    alert_empty:         'Bestellung leer – Getränke hinzufügen.',
    confirm_delete:      'Diese Bestellung löschen?',
    confirm_clear_all:   'Alle gespeicherten Bestellungen löschen?',
    confirm_cancel_edit: 'Bearbeitung abbrechen? Änderungen gehen verloren.',
    orders_count: n => `${n} ${n === 1 ? 'Bestellung' : 'Bestellungen'}`,
  },
};

let lang = localStorage.getItem('bar_lang') || 'ru';

function t(key) {
  return TRANSLATIONS[lang][key] ?? TRANSLATIONS.ru[key] ?? key;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.documentElement.lang = lang;
  $('lang-btn').textContent = lang === 'ru' ? 'DE' : 'RU';
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

const allItems = [];
Object.entries(MENU).forEach(([category, items]) => {
  items.forEach(item => allItems.push({ ...item, category }));
});

// ─── State ───
let currentOrder = { table: '', customer: '', items: [] };
let savedOrders = [];
let editingOrderId = null;

function loadSaved() {
  try { savedOrders = JSON.parse(localStorage.getItem('bar_saved_orders') || '[]'); }
  catch { savedOrders = []; }
}

function persistSaved() {
  localStorage.setItem('bar_saved_orders', JSON.stringify(savedOrders));
}

// ─── Payment data persistence ───
function loadPaymentData() {
  try { return JSON.parse(localStorage.getItem('bar_payment_data') || '{}'); }
  catch { return {}; }
}

function savePaymentEntry(id, gave, pays) {
  const data = loadPaymentData();
  if (gave || pays) {
    data[id] = { gave, pays };
  } else {
    delete data[id];
  }
  localStorage.setItem('bar_payment_data', JSON.stringify(data));
}

function removePaymentEntry(id) {
  const data = loadPaymentData();
  delete data[id];
  localStorage.setItem('bar_payment_data', JSON.stringify(data));
}

function clearPaymentData() {
  localStorage.removeItem('bar_payment_data');
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
const editBanner     = $('edit-banner');
const editBannerText = $('edit-banner-text');
const saveBtn        = $('save-order-btn');
const grandTotalBar  = $('grand-total-bar');
const grandTotalEl   = $('grand-total-amount');
const grandTipsRow   = $('grand-tips-row');
const grandTipsEl    = $('grand-tips-amount');
const grandToggleBtn = $('grand-toggle-btn');

const tipsState = {};

// ─── Helpers ───
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toCents(price) {
  return Math.round(price * 100);
}

function lineTotal(price, qty) {
  return toCents(price) * qty / 100;
}

function getTotal(items) {
  const cents = items.reduce((s, i) => s + toCents(i.price) * i.qty, 0);
  return cents / 100;
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
        <button class="btn-add" data-idx="${idx}" aria-label="+">+</button>
      `;
      menuList.appendChild(div);
    });
  }

  if (!hasAny) {
    menuList.innerHTML = `<div class="no-results">${t('no_results')}</div>`;
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
    currentOrder.items.push({ name: item.name, price: item.price, volume: item.volume || '', qty: 1 });
  }
  renderOrder();
  updateBadges();
  haptic('light');
}

function changeQty(name, delta) {
  const item = currentOrder.items.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) currentOrder.items = currentOrder.items.filter(i => i.name !== name);
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
  if (!currentOrder.items.length && !editingOrderId) return;
  tgConfirm(t('confirm_clear'), () => {
    currentOrder.items = [];
    cancelEdit();
    renderOrder();
    updateBadges();
  });
}

function cancelEdit() {
  editingOrderId = null;
  editBanner.style.display = 'none';
  saveBtn.textContent = t('btn_save');
  saveBtn.classList.remove('btn-save-update');
}

function updateEditBanner(order) {
  const parts = [];
  if (order.table !== '—') parts.push(`${t('table_prefix')} ${order.table}`);
  if (order.customer) parts.push(order.customer);
  const label = parts.length ? parts.join(' · ') : t('order_word');
  editBannerText.textContent = `${t('editing')}: ${label}`;
  editBanner.style.display = 'flex';
  saveBtn.textContent = t('btn_update');
  saveBtn.classList.add('btn-save-update');
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
      <div class="empty-title">${t('empty_order_title')}</div>
      <div class="empty-sub">${t('empty_order_sub')}</div>
    `;
    orderItemsEl.appendChild(empty);
    return;
  }

  orderFooter.style.display = 'block';

  currentOrder.items.forEach(item => {
    const line = lineTotal(item.price, item.qty);
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
      <div class="order-item-price">${line.toFixed(2)}€</div>
      <button class="btn-remove" data-action="remove" data-name="${esc(item.name)}">✕</button>
    `;
    orderItemsEl.appendChild(div);
  });

  totalPriceEl.textContent = `${getTotal(currentOrder.items).toFixed(2)}€`;
}

// ─── Save / update order ───
function saveOrder() {
  if (!currentOrder.items.length) {
    tgAlert(t('alert_empty'));
    return;
  }

  const dateLocale = lang === 'de' ? 'de-DE' : 'ru-RU';
  const dateStr = new Date().toLocaleString(dateLocale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  if (editingOrderId !== null) {
    const idx = savedOrders.findIndex(o => o.id === editingOrderId);
    if (idx !== -1) {
      savedOrders[idx] = {
        ...savedOrders[idx],
        table: tableInput.value.trim() || '—',
        customer: customerInput.value.trim() || '',
        items: currentOrder.items.map(i => ({ ...i })),
        total: getTotal(currentOrder.items),
        updatedAt: dateStr,
      };
    }
  } else {
    savedOrders.unshift({
      id: Date.now(),
      table: tableInput.value.trim() || '—',
      customer: customerInput.value.trim() || '',
      items: currentOrder.items.map(i => ({ ...i })),
      total: getTotal(currentOrder.items),
      createdAt: dateStr,
    });
  }

  persistSaved();
  cancelEdit();
  currentOrder.items = [];
  tableInput.value = '';
  customerInput.value = '';
  renderOrder();
  updateBadges();
  renderSavedOrders();
  switchTab('orders');
  haptic('success');
}

// ─── Edit saved order ───
function editSavedOrder(id) {
  const order = savedOrders.find(o => o.id === id);
  if (!order) return;
  currentOrder.items = order.items.map(i => ({ ...i }));
  tableInput.value = order.table !== '—' ? order.table : '';
  customerInput.value = order.customer || '';
  editingOrderId = id;
  updateEditBanner(order);
  renderOrder();
  updateBadges();
  switchTab('order');
  haptic('light');
}

// ─── Saved orders ───
function deleteSavedOrder(id) {
  tgConfirm(t('confirm_delete'), () => {
    savedOrders = savedOrders.filter(o => o.id !== id);
    persistSaved();
    removePaymentEntry(id);
    renderSavedOrders();
    updateBadges();
  });
}

function clearAllOrders() {
  if (!savedOrders.length) return;
  tgConfirm(t('confirm_clear_all'), () => {
    savedOrders = [];
    persistSaved();
    clearPaymentData();
    renderSavedOrders();
    updateBadges();
  });
}

function renderSavedOrders() {
  savedList.innerHTML = '';
  Object.keys(tipsState).forEach(k => delete tipsState[k]);
  grandTipsRow.style.display = 'none';
  grandTotalBar.style.display = 'none';

  if (!savedOrders.length) {
    ordersToolbar.style.display = 'none';
    grandToggleBtn.style.display = 'none';
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-icon">📋</div>
      <div class="empty-title">${t('empty_orders_title')}</div>
      <div class="empty-sub">${t('empty_orders_sub')}</div>
    `;
    savedList.appendChild(empty);
    return;
  }

  ordersToolbar.style.display = 'flex';
  ordersCount.textContent = t('orders_count')(savedOrders.length);
  $('clear-all-orders-btn').textContent = t('btn_clear_all');

  const grandCents = savedOrders.reduce((s, o) => s + toCents(o.total), 0);
  grandTotalEl.textContent = `${(grandCents / 100).toFixed(2)}€`;
  grandToggleBtn.style.display = 'flex';

  // Update grand total bar labels
  const grandLabels = document.querySelectorAll('.grand-total-label');
  if (grandLabels[0]) grandLabels[0].textContent = t('grand_orders');
  if (grandLabels[1]) grandLabels[1].textContent = t('grand_tips');

  savedOrders.forEach(order => {
    const parts = [];
    if (order.table !== '—') parts.push(`${t('table_prefix')} ${order.table}`);
    if (order.customer) parts.push(order.customer);
    const title = parts.length ? parts.join(' · ') : t('order_word');

    const itemsHtml = order.items.map(item => `
      <div class="saved-order-row">
        <span class="saved-order-row-name">${esc(item.name)}</span>
        <span class="saved-order-row-qty">× ${item.qty}${item.qty > 1 ? ` (${item.price.toFixed(2)}€)` : ''}</span>
        <span class="saved-order-row-price">${lineTotal(item.price, item.qty).toFixed(2)}€</span>
      </div>
    `).join('');

    const dateLabel = order.updatedAt
      ? `${order.createdAt} · ${t('edited')} ${order.updatedAt}`
      : order.createdAt;

    const card = document.createElement('div');
    card.className = 'saved-order-card';
    card.innerHTML = `
      <div class="saved-order-top">
        <div>
          <div class="saved-order-title">${esc(title)}</div>
          <div class="saved-order-date">${dateLabel}</div>
        </div>
        <button class="btn-delete-order" data-id="${order.id}">${t('btn_delete')}</button>
      </div>
      <div class="saved-order-items">${itemsHtml}</div>
      <div class="saved-order-bottom">
        <span class="saved-order-total">${t('total_colon')} ${order.total.toFixed(2)}€</span>
        <button class="btn-edit-order" data-id="${order.id}">${t('btn_edit')}</button>
      </div>
      <div class="pay-section">
        <div class="pay-inputs">
          <div class="pay-field">
            <span class="pay-label">${t('pay_gave')}</span>
            <div class="pay-input-wrap">
              <input type="number" class="pay-input pay-gave" data-id="${order.id}"
                     placeholder="${order.total.toFixed(2)}" min="0" step="0.5" inputmode="decimal">
              <span class="pay-cur">€</span>
            </div>
          </div>
          <div class="pay-field">
            <span class="pay-label">${t('pay_pays')}</span>
            <div class="pay-input-wrap">
              <input type="number" class="pay-input pay-pays" data-id="${order.id}"
                     placeholder="${order.total.toFixed(2)}" min="0" step="0.5" inputmode="decimal">
              <span class="pay-cur">€</span>
            </div>
          </div>
        </div>
        <div class="pay-result" id="pay-result-${order.id}"></div>
      </div>
    `;
    savedList.appendChild(card);
  });

  const paymentData = loadPaymentData();
  Object.entries(paymentData).forEach(([id, data]) => {
    const gaveEl = savedList.querySelector(`.pay-gave[data-id="${id}"]`);
    const paysEl = savedList.querySelector(`.pay-pays[data-id="${id}"]`);
    if (!gaveEl || !paysEl) return;
    if (data.gave) gaveEl.value = data.gave;
    if (data.pays) paysEl.value = data.pays;
    calculatePayment(+id);
  });
}

// ─── Export via bot ───
function exportOrdersCSV() {
  if (!savedOrders.length) return;

  if (!tg) {
    alert('Приложение должно быть открыто через Telegram.');
    return;
  }

  const payload = {
    orders: savedOrders.map(o => ({
      t: o.table,
      c: o.customer || '',
      i: o.items.map(i => ({ n: i.name, q: i.qty })),
      s: o.total,
      d: o.updatedAt || o.createdAt || '',
    })),
    tips: savedOrders.map(o => (tipsState[o.id] || 0) / 100),
  };

  const json = JSON.stringify(payload);

  if (json.length > 4096) {
    tgAlert(lang === 'de'
      ? '⚠️ Zu viele Bestellungen. Bitte einige löschen und erneut versuchen.'
      : '⚠️ Слишком много заказов для экспорта. Удалите часть и попробуйте снова.');
    return;
  }

  try {
    tg.sendData(json);
  } catch {
    tgAlert(lang === 'de'
      ? '❌ Fehler: App muss über Bot-Button geöffnet werden.'
      : '❌ Ошибка: откройте приложение через кнопку бота (команда /start).');
  }
}

// ─── Payment calculator ───
function calculatePayment(id) {
  const order = savedOrders.find(o => o.id === id);
  if (!order) return;

  const gaveEl   = savedList.querySelector(`.pay-gave[data-id="${id}"]`);
  const paysEl   = savedList.querySelector(`.pay-pays[data-id="${id}"]`);
  const resultEl = $(`pay-result-${id}`);
  if (!gaveEl || !paysEl || !resultEl) return;

  const gaveCents  = toCents(parseFloat(gaveEl.value) || 0);
  const paysCents  = toCents(parseFloat(paysEl.value) || 0);
  const totalCents = toCents(order.total);

  if (!gaveCents && !paysCents) {
    resultEl.innerHTML = '';
    tipsState[id] = 0;
    updateGrandTips();
    savePaymentEntry(id, 0, 0);
    return;
  }

  const effectivePays = paysCents > 0 ? paysCents : totalCents;
  const tipCents      = effectivePays - totalCents;
  const changeCents   = gaveCents - effectivePays;

  let html = '<div class="pay-calc">';

  if (gaveCents > 0 && gaveCents < effectivePays) {
    html += `<div class="pay-row pay-warn">${t('pay_warn')}</div>`;
  } else {
    if (tipCents > 0) {
      html += `<div class="pay-row pay-tip"><span>${t('pay_tip')}</span><span>+${(tipCents/100).toFixed(2)}€</span></div>`;
    } else if (tipCents < 0) {
      html += `<div class="pay-row pay-shortage"><span>${t('pay_shortage')}</span><span>${(Math.abs(tipCents)/100).toFixed(2)}€</span></div>`;
    } else {
      html += `<div class="pay-row pay-zero"><span>${t('pay_no_tip')}</span><span>0.00€</span></div>`;
    }
    if (gaveCents > 0) {
      html += `<div class="pay-row pay-change"><span>${t('pay_change')}</span><span>${(Math.max(0,changeCents)/100).toFixed(2)}€</span></div>`;
    }
  }

  html += '</div>';
  resultEl.innerHTML = html;

  tipsState[id] = (tipCents > 0 && !(gaveCents > 0 && gaveCents < effectivePays)) ? tipCents : 0;
  updateGrandTips();
  savePaymentEntry(id, parseFloat(gaveEl.value) || 0, parseFloat(paysEl.value) || 0);
}

function updateGrandTips() {
  const totalTipCents = Object.values(tipsState).reduce((s, c) => s + c, 0);
  if (totalTipCents > 0) {
    grandTipsEl.textContent = `${(totalTipCents / 100).toFixed(2)}€`;
    grandTipsRow.style.display = 'flex';
  } else {
    grandTipsRow.style.display = 'none';
  }
  positionToggleBtn();
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

// ─── Grand total position ───
function positionToggleBtn() {
  if (grandTotalBar.style.display !== 'none') {
    grandToggleBtn.style.bottom = (grandTotalBar.offsetHeight + 10) + 'px';
  } else {
    grandToggleBtn.style.bottom = '10px';
  }
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
  const del  = e.target.closest('.btn-delete-order');
  if (del)  { deleteSavedOrder(+del.dataset.id); return; }
  const edit = e.target.closest('.btn-edit-order');
  if (edit) editSavedOrder(+edit.dataset.id);
});

savedList.addEventListener('input', e => {
  const input = e.target.closest('.pay-input');
  if (input) calculatePayment(+input.dataset.id);
});

$('edit-cancel-btn').addEventListener('click', () => {
  tgConfirm(t('confirm_cancel_edit'), () => {
    currentOrder.items = [];
    tableInput.value = '';
    customerInput.value = '';
    cancelEdit();
    renderOrder();
    updateBadges();
    switchTab('orders');
  });
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
$('export-orders-btn').addEventListener('click', exportOrdersCSV);

grandToggleBtn.addEventListener('click', () => {
  const visible = grandTotalBar.style.display !== 'none';
  grandTotalBar.style.display = visible ? 'none' : 'flex';
  grandToggleBtn.classList.toggle('grand-toggle-btn--active', !visible);
  positionToggleBtn();
  haptic('light');
});

$('lang-btn').addEventListener('click', () => {
  lang = lang === 'ru' ? 'de' : 'ru';
  localStorage.setItem('bar_lang', lang);
  applyTranslations();
  renderMenu(searchInput.value);
  renderOrder();
  renderSavedOrders();
  if (editingOrderId !== null) {
    const order = savedOrders.find(o => o.id === editingOrderId);
    if (order) updateEditBanner(order);
  }
  haptic('light');
});

// ─── Init ───
loadSaved();
applyTranslations();
renderMenu();
renderOrder();
renderSavedOrders();
updateBadges();
