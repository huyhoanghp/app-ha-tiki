'use strict';

const DENOMS = [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];

const DEFAULT_SETTINGS = {
  owner: 'NGUYỄN HOÀNG HẢI ANH',
  cycleWeeks: 9,
  startDate: '2026-11-01',
  sources: ['Kiểm kê đầu kỳ', 'Tiền lương', 'Thưởng', 'Tiết kiệm hàng tuần', 'Khác'],
  purposes: ['Mua sắm', 'Chi tiêu cá nhân', 'Quà tặng', 'Khác']
};

const INVENTORY = [
  [500000, 4], [200000, 10], [100000, 12], [50000, 18], [20000, 12],
  [10000, 5], [5000, 6], [2000, 6], [1000, 10]
];
const SEED_DATE = '2026-11-01';

const state = {
  user: null,
  settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
  transactions: [],
  txMode: 'nap',
  editId: null,
  dataReady: false
};

let store = null;
const isFirebase = !!(firebaseConfig.apiKey && String(firebaseConfig.apiKey).indexOf('YOUR_') === -1);

/* ================= UTILS ================= */

const $id = (id) => document.getElementById(id);

function fmtVND(n) {
  return Math.round(n).toLocaleString('vi-VN') + ' ₫';
}

function fmtCompact(n) {
  const v = Math.round(n);
  if (Math.abs(v) >= 1000000) return (v / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + 'tr';
  if (Math.abs(v) >= 1000) return Math.round(v / 1000) + 'k';
  return String(v);
}

function fmtDenom(d) {
  return d.toLocaleString('vi-VN') + ' ₫';
}

function fmtDateVN(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function parseDate(s) {
  return new Date(s + 'T00:00:00');
}

function dateToStr(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function daysBetween(fromStr, toStr) {
  return Math.round((parseDate(toStr) - parseDate(fromStr)) / 86400000);
}

function weekStartOf(dateStr) {
  const d = parseDate(dateStr);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d;
}

/* ================= SEED ================= */

function seedTransactions() {
  return INVENTORY.map(([denom, qty]) => ({
    type: 'nap',
    date: SEED_DATE,
    denom: denom,
    qty: qty,
    amount: denom * qty,
    source: 'Kiểm kê đầu kỳ',
    note: 'Kiểm kê tiền mặt 1-11-26 (Tuần 8)',
    createdAt: '2026-11-01T00:00:00.000Z'
  }));
}

/* ================= DATA LAYER ================= */

const MockStore = {
  _key: 'tietkiem_data_v1',
  _read() {
    const raw = localStorage.getItem(this._key);
    return raw ? JSON.parse(raw) : null;
  },
  _write(data) {
    localStorage.setItem(this._key, JSON.stringify(data));
  },
  async init() {
    let data = this._read();
    if (!data) {
      const txs = seedTransactions();
      data = {
        settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)),
        transactions: {}
      };
      txs.forEach((t, i) => { data.transactions['seed' + i] = t; });
      this._write(data);
    }
    return data;
  },
  async addTransaction(tx) {
    const data = this._read();
    const id = 'tx' + Date.now() + Math.floor(Math.random() * 1000);
    data.transactions[id] = tx;
    this._write(data);
    return id;
  },
  async updateTransaction(id, tx) {
    const data = this._read();
    data.transactions[id] = Object.assign({}, data.transactions[id], tx);
    this._write(data);
  },
  async deleteTransaction(id) {
    const data = this._read();
    delete data.transactions[id];
    this._write(data);
  },
  async saveSettings(settings) {
    const data = this._read() || { transactions: {} };
    data.settings = settings;
    this._write(data);
  },
  async seedInventory() {
    const data = this._read() || { settings: state.settings, transactions: {} };
    if (Object.keys(data.transactions).length > 0) return;
    const txs = seedTransactions();
    txs.forEach((t, i) => { data.transactions['seed' + i] = t; });
    this._write(data);
  }
};

const FirebaseStore = {
  _db: null,
  async signIn(email, pass) {
    return firebase.auth().signInWithEmailAndPassword(email, pass);
  },
  async signOut() {
    return firebase.auth().signOut();
  },
  watch(onData, onErr) {
    firebase.initializeApp(firebaseConfig);
    this._db = firebase.database();
    firebase.auth().onAuthStateChanged((user) => {
      state.user = user ? { email: user.email } : null;
      state.dataReady = false;
      onAuthChanged();
      if (user) {
        this._db.ref('/').on('value', (snap) => {
          state.dataReady = true;
          onData(snap.val());
        }, (err) => onErr(err));
      } else {
        this._db.ref('/').off();
        onData(null);
      }
    });
  },
  async addTransaction(tx) {
    return this._db.ref('transactions').push(tx);
  },
  async updateTransaction(id, tx) {
    return this._db.ref('transactions/' + id).update(tx);
  },
  async deleteTransaction(id) {
    return this._db.ref('transactions/' + id).remove();
  },
  async saveSettings(settings) {
    return this._db.ref('settings').set(settings);
  },
  async seedInventory() {
    const snap = await this._db.ref('transactions').once('value');
    if (snap.exists()) return;
    const txs = seedTransactions();
    for (const t of txs) {
      await this._db.ref('transactions').push(t);
    }
  }
};

function normalizeData(data) {
  const d = data || {};
  const settings = Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), d.settings || {});
  if (!Array.isArray(settings.sources)) settings.sources = DEFAULT_SETTINGS.sources.slice();
  if (!Array.isArray(settings.purposes)) settings.purposes = DEFAULT_SETTINGS.purposes.slice();
  const txsObj = d.transactions || {};
  const txs = Object.keys(txsObj).map((id) => Object.assign({ id: id }, txsObj[id]));
  txs.sort((a, b) => {
    if ((a.date || '') !== (b.date || '')) return (b.date || '').localeCompare(a.date || '');
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
  return { settings: settings, transactions: txs };
}

function handleData(data) {
  const n = normalizeData(data);
  state.settings = n.settings;
  state.transactions = n.transactions;
  renderAll();
}

/* ================= CRUD WRAPPERS ================= */

async function addTransaction(data) {
  await store.addTransaction(data);
  await rememberOption(data.type === 'nap' ? 'sources' : 'purposes', data.type === 'nap' ? data.source : data.purpose);
}

async function rememberOption(listKey, value) {
  if (!value) return;
  const list = state.settings[listKey] || [];
  if (list.indexOf(value) === -1) {
    state.settings[listKey] = list.concat([value]);
    await store.saveSettings(state.settings);
  }
}

/* ================= STATS ================= */

function computeStats() {
  let total = 0, totalQty = 0, napSum = 0, rutSum = 0;
  const activeDays = new Set();
  for (const t of state.transactions) {
    if (t.type === 'nap') {
      total += t.amount;
      totalQty += t.qty;
      napSum += t.amount;
      activeDays.add(t.date);
    } else {
      total -= t.amount;
      totalQty -= t.qty;
      rutSum += t.amount;
    }
  }
  const start = state.settings.startDate || SEED_DATE;
  const today = todayStr();
  const lastTx = state.transactions.length ? state.transactions.reduce((m, t) => t.date > m ? t.date : m, start) : start;
  const end = today > lastTx ? today : lastTx;
  const daysElapsed = Math.max(1, daysBetween(start, end) + 1);
  const weeksElapsed = Math.max(1, Math.ceil(daysElapsed / 7));
  const ds = parseDate(start), de = parseDate(end);
  const monthsElapsed = Math.max(1, (de.getFullYear() - ds.getFullYear()) * 12 + (de.getMonth() - ds.getMonth()) + 1);
  const yearsElapsed = Math.max(1, de.getFullYear() - ds.getFullYear() + 1);
  const daysSinceStart = Math.max(0, daysBetween(start, today));
  const cycleWeeks = Math.max(1, parseInt(state.settings.cycleWeeks, 10) || 9);
  const weekInCycle = (Math.floor(daysSinceStart / 7) % cycleWeeks) + 1;
  return {
    total: total,
    totalQty: totalQty,
    napSum: napSum,
    rutSum: rutSum,
    activeDays: activeDays.size,
    daysElapsed: daysElapsed,
    weeksElapsed: weeksElapsed,
    monthsElapsed: monthsElapsed,
    yearsElapsed: yearsElapsed,
    avgWeek: total / weeksElapsed,
    avgMonth: total / monthsElapsed,
    avgYear: total / yearsElapsed,
    weekInCycle: weekInCycle,
    cycleWeeks: cycleWeeks
  };
}

function groupBy(type) {
  const map = {};
  for (const t of state.transactions) {
    let key;
    if (type === 'week') key = dateToStr(weekStartOf(t.date));
    else if (type === 'month') key = t.date.slice(0, 7);
    else key = t.date.slice(0, 4);
    if (!map[key]) map[key] = { nap: 0, rut: 0, count: 0 };
    map[key].count++;
    if (t.type === 'nap') map[key].nap += t.amount;
    else map[key].rut += t.amount;
  }
  return map;
}

function sortedKeys(map, desc) {
  const keys = Object.keys(map).sort();
  return desc ? keys.reverse() : keys;
}

function lastNPeriods(type, n) {
  const result = [];
  const now = parseDate(todayStr());
  if (type === 'week') {
    let ws = weekStartOf(todayStr());
    for (let i = 0; i < n; i++) {
      result.unshift({ key: dateToStr(ws), from: dateToStr(ws), to: dateToStr(new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() + 6)) });
      ws = new Date(ws.getFullYear(), ws.getMonth(), ws.getDate() - 7);
    }
  } else if (type === 'month') {
    let d = new Date(now.getFullYear(), now.getMonth(), 1);
    for (let i = 0; i < n; i++) {
      result.unshift({ key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') });
      d = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    }
  } else {
    for (let i = n - 1; i >= 0; i--) {
      result.push({ key: String(now.getFullYear() - i) });
    }
  }
  return result;
}

function sumPeriod(type, key) {
  let nap = 0, rut = 0, count = 0;
  for (const t of state.transactions) {
    let k;
    if (type === 'week') k = dateToStr(weekStartOf(t.date));
    else if (type === 'month') k = t.date.slice(0, 7);
    else k = t.date.slice(0, 4);
    if (k !== key) continue;
    count++;
    if (t.type === 'nap') nap += t.amount;
    else rut += t.amount;
  }
  return { nap: nap, rut: rut, net: nap - rut, count: count };
}
