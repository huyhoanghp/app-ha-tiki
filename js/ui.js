'use strict';

let toastTimer = null;
let confirmAction = null;
let dateTarget = null;
let calYear = 0;
let calMonth = 0;
let pinResolver = null;
let pinMode = 'setup';

/* ================= THEME ================= */

const THEME_KEY = 'tk_theme';

function applyTheme(theme, save) {
  const t = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
  try {
    if (save) localStorage.setItem(THEME_KEY, t);
    else localStorage.removeItem(THEME_KEY);
  } catch (e) {}
  const icon = $id('btn-theme');
  if (icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
  if (typeof renderCharts === 'function' && state.user) renderCharts();
  if (typeof renderReportCharts === 'function' && state.user && $id('tab-baocao').classList.contains('active')) renderReportCharts();
}

function initTheme() {
  let t = null;
  try { t = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(t || state.settings.theme || 'light', !!t);
}

async function toggleTheme() {
  const next = isDarkTheme() ? 'light' : 'dark';
  applyTheme(next, true);
  state.settings.theme = next;
  try { await store.saveSettings(state.settings); } catch (e) {}
}

/* ================= COMBO (droplist tự xây) ================= */

function setCombo(id, value, label) {
  const input = $id(id);
  input.dataset.value = value == null ? '' : String(value);
  input.value = label == null ? '' : label;
}

function comboItemsFor(id) {
  if (id === 'tx-denom') return DENOMS.map((d) => ({ value: String(d), label: fmtDenom(d) }));
  if (id === 'tx-source') return (state.settings.sources || []).map((s) => ({ value: s, label: s }));
  if (id === 'tx-purpose') return (state.settings.purposes || []).map((s) => ({ value: s, label: s }));
  if (id === 'f-type') return [
    { value: '', label: '📋 Tất cả loại' },
    { value: 'nap', label: '💰 Nạp tiền' },
    { value: 'rut', label: '💸 Rút tiền' }
  ];
  return [];
}

function closeCombos() {
  document.querySelectorAll('.combo-menu').forEach((m) => m.classList.add('hidden'));
}

function openCombo(combo) {
  closeCombos();
  const input = combo.querySelector('.combo-input');
  const menu = combo.querySelector('.combo-menu');
  if (input.dataset.value) {
    const cur = comboItemsFor(input.id).find((it) => it.value === input.dataset.value);
    if (cur) input.value = cur.label;
  }
  const items = comboItemsFor(input.id);
  const allowCustom = input.id === 'tx-source' || input.id === 'tx-purpose';
  let html = items.map((it) =>
    `<div class="combo-item" data-v="${escHtml(it.value)}" data-l="${escHtml(it.label)}">${escHtml(it.label)}</div>`
  ).join('');
  if (allowCustom) html += '<div class="combo-item combo-custom">✏️ Nhập khác...</div>';
  menu.innerHTML = html;
  menu.querySelectorAll('.combo-item').forEach((el) => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      if (el.classList.contains('combo-custom')) {
        menu.classList.add('hidden');
        input.readOnly = false;
        input.value = '';
        input.focus();
        const finish = () => {
          input.removeEventListener('blur', finish);
          const v = input.value.trim();
          input.readOnly = true;
          setCombo(input.id, v, v);
          input.dispatchEvent(new Event('combochange', { bubbles: true }));
        };
        input.addEventListener('blur', finish);
        input.addEventListener('keydown', function keyH(ev) {
          if (ev.key === 'Enter') {
            ev.preventDefault();
            input.removeEventListener('keydown', keyH);
            input.blur();
          }
        });
        return;
      }
      setCombo(input.id, el.dataset.v, el.dataset.l);
      input.dispatchEvent(new Event('combochange', { bubbles: true }));
      closeCombos();
    });
  });
  menu.classList.remove('hidden');
}

/* ================= DATE PICKER (lịch tự xây) ================= */

function setDateField(el, iso) {
  el.dataset.iso = iso || '';
  el.value = iso ? fmtDateVN(iso) : '';
}

function openDatePicker(el) {
  closeCombos();
  dateTarget = el;
  const iso = el.dataset.iso || todayStr();
  const parts = iso.split('-').map(Number);
  calYear = parts[0];
  calMonth = parts[1];
  renderCalendar();
  $id('modal-date').classList.remove('hidden');
}

function renderCalendar() {
  $id('cal-title').textContent = 'Tháng ' + calMonth + '/' + calYear;
  const grid = $id('cal-grid');
  const first = new Date(calYear, calMonth - 1, 1);
  let startDow = first.getDay();
  startDow = startDow === 0 ? 6 : startDow - 1;
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const todayIso = todayStr();
  const sel = dateTarget ? (dateTarget.dataset.iso || '') : '';
  let html = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => `<div class="cal-dow">${d}</div>`).join('');
  for (let i = 0; i < startDow; i++) html += '<div class="cal-day cal-empty"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = calYear + '-' + String(calMonth).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const cls = 'cal-day' + (iso === todayIso ? ' cal-today' : '') + (iso === sel ? ' cal-selected' : '');
    html += `<div class="${cls}" data-iso="${iso}">${d}</div>`;
  }
  grid.innerHTML = html;
  grid.querySelectorAll('.cal-day').forEach((c) => {
    c.addEventListener('click', () => pickDate(c.dataset.iso));
  });
}

function pickDate(iso) {
  if (dateTarget) {
    setDateField(dateTarget, iso);
    dateTarget.dispatchEvent(new Event('datechange', { bubbles: true }));
  }
  closeDatePicker();
}

function closeDatePicker() {
  $id('modal-date').classList.add('hidden');
  dateTarget = null;
}

function calShift(n) {
  calMonth += n;
  if (calMonth < 1) { calMonth = 12; calYear--; }
  if (calMonth > 12) { calMonth = 1; calYear++; }
  renderCalendar();
}

/* ================= BIOMETRIC + PIN ================= */

const BIO_KEY = 'tk_biocreds';

function bioGetAll() {
  try { return JSON.parse(localStorage.getItem(BIO_KEY)) || {}; } catch (e) { return {}; }
}

function bioSet(email, data) {
  const all = bioGetAll();
  all[email] = data;
  localStorage.setItem(BIO_KEY, JSON.stringify(all));
}

function bioRemove(email) {
  const all = bioGetAll();
  delete all[email];
  localStorage.setItem(BIO_KEY, JSON.stringify(all));
}

function obfuscate(s) {
  const k = 'tk2026';
  let out = '';
  for (let i = 0; i < s.length; i++) out += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length));
  return btoa(unescape(encodeURIComponent(out)));
}

function deobfuscate(b) {
  const k = 'tk2026';
  const s = decodeURIComponent(escape(atob(b)));
  let out = '';
  for (let i = 0; i < s.length; i++) out += String.fromCharCode(s.charCodeAt(i) ^ k.charCodeAt(i % k.length));
  return out;
}

function b64urlEncode(buf) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s) {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

async function bioAvailable() {
  try {
    return !!(window.PublicKeyCredential
      && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
      && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable());
  } catch (e) { return false; }
}

function bioErrText(err) {
  const m = (err && err.message) || '';
  if (m.indexOf('credential manager') > -1) return 'Trình quản lý thông tin xác thực của thiết bị từ chối yêu cầu';
  if (err && err.name === 'NotAllowedError') return 'Bị hủy hoặc hết thời gian chờ';
  if (err && err.name === 'NotSupportedError') return 'Thiết bị không hỗ trợ';
  if (err && err.name === 'SecurityError') return 'Lỗi bảo mật (rp.id không khớp)';
  return m || 'Lỗi không rõ';
}

function openPinModal(mode) {
  pinMode = mode;
  return new Promise((resolve) => {
    pinResolver = resolve;
    $id('pin-title').textContent = mode === 'setup' ? '🔐 Tạo PIN dự phòng' : '🔐 Nhập PIN nhanh';
    $id('pin-sub').textContent = mode === 'setup'
      ? 'Thiết bị này không bật được sinh trắc học. Tạo PIN 4–6 chữ số để đăng nhập nhanh trên thiết bị này.'
      : 'Nhập PIN bạn đã tạo cho thiết bị này.';
    $id('pin-input').value = '';
    $id('pin-input2').value = '';
    $id('pin-input2').classList.toggle('hidden', mode !== 'setup');
    $id('modal-pin').classList.remove('hidden');
    setTimeout(() => $id('pin-input').focus(), 60);
  });
}

function closePinModal(result) {
  $id('modal-pin').classList.add('hidden');
  if (pinResolver) {
    const r = pinResolver;
    pinResolver = null;
    r(result);
  }
}

function confirmPin() {
  const p1 = $id('pin-input').value.trim();
  const p2 = $id('pin-input2').value.trim();
  if (!/^\d{4,6}$/.test(p1)) { toast('⚠️ PIN gồm 4–6 chữ số'); return; }
  if (pinMode === 'setup') {
    if (p1 !== p2) { toast('⚠️ PIN nhập lại không khớp'); return; }
    closePinModal(p1);
  } else {
    closePinModal(p1);
  }
}

function updateBioLoginVisibility() {
  const wrap = $id('bio-login-wrap');
  if (!wrap) return;
  const entries = Object.entries(bioGetAll()).filter(([, d]) => d && d.pwd);
  if (entries.length) {
    const [email] = entries[0];
    wrap.classList.remove('hidden');
    $id('bio-login-email').textContent = '🔐 ' + email;
  } else {
    wrap.classList.add('hidden');
  }
}

function doBioLogin(email, data) {
  $id('login-email').value = email;
  $id('login-pass').value = deobfuscate(data.pwd);
  $id('login-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
}

async function bioLogin() {
  const entries = Object.entries(bioGetAll()).filter(([, d]) => d && d.pwd);
  if (!entries.length) return;
  const [email, data] = entries[0];
  const btn = $id('btn-bio-login');
  const restore = () => {
    btn.disabled = false;
    btn.textContent = '👆 Đăng nhập nhanh (sinh trắc / PIN)';
  };
  btn.disabled = true;
  btn.textContent = '⏳ Đang xác thực...';
  try {
    if (data.credId) {
      try {
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge: challenge,
            rpId: location.hostname,
            allowCredentials: [{ id: b64urlDecode(data.credId), type: 'public-key' }],
            userVerification: 'required',
            timeout: 60000
          }
        });
        if (assertion) {
          doBioLogin(email, data);
          restore();
          return;
        }
      } catch (err) {
        toast('⚠️ Sinh trắc không thành công (' + bioErrText(err) + ') — thử PIN nhanh');
      }
    }
    if (data.pin) {
      const pin = await openPinModal('login');
      if (pin && pin === data.pin) {
        doBioLogin(email, data);
      } else if (pin) {
        toast('❌ PIN không đúng');
      }
      restore();
      return;
    }
    toast('⚠️ Thiết bị này chưa có PIN dự phòng — hãy đăng nhập bằng mật khẩu rồi bật lại đăng nhập nhanh');
    restore();
  } catch (err) {
    restore();
  }
}

async function toggleBioSetting(enabled) {
  if (!isFirebase) { $id('st-bio').checked = false; toast('🔒 Chỉ dùng được khi kết nối Firebase'); return; }
  const email = state.user && state.user.email;
  if (!email) return;
  if (!enabled) {
    bioRemove(email);
    toast('✅ Đã tắt đăng nhập nhanh trên thiết bị này');
    updateBioNote();
    return;
  }
  const pwd = $id('st-curpass').value;
  if (!pwd) {
    $id('st-bio').checked = false;
    toast('⚠️ Nhập "Mật khẩu hiện tại" bên trên trước khi bật đăng nhập nhanh');
    return;
  }
  let credId = '';
  if (await bioAvailable()) {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const user = {
      id: crypto.getRandomValues(new Uint8Array(16)),
      name: email,
      displayName: state.settings.owner || email
    };
    const variants = [
      {
        challenge: challenge,
        rp: { name: 'App Tiet Kiem', id: location.hostname },
        user: user,
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { userVerification: 'required', residentKey: 'preferred' },
        timeout: 60000,
        attestation: 'none'
      },
      {
        challenge: challenge,
        rp: { name: 'App Tiet Kiem' },
        user: user,
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { userVerification: 'required' },
        timeout: 60000,
        attestation: 'none'
      },
      {
        challenge: challenge,
        rp: { name: 'App Tiet Kiem' },
        user: user,
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { userVerification: 'preferred' },
        timeout: 60000,
        attestation: 'none'
      }
    ];
    for (const opt of variants) {
      try {
        const cred = await navigator.credentials.create({ publicKey: opt });
        credId = b64urlEncode(cred.rawId);
        break;
      } catch (err) {
        credId = '';
      }
    }
  }
  if (credId) {
    bioSet(email, { credId: credId, pwd: obfuscate(pwd), pin: '' });
    toast('✅ Đã bật đăng nhập bằng sinh trắc học trên thiết bị này');
  } else {
    const pin = await openPinModal('setup');
    if (!pin) {
      $id('st-bio').checked = false;
      updateBioNote();
      return;
    }
    bioSet(email, { credId: '', pwd: obfuscate(pwd), pin: pin });
    toast('✅ Đã bật đăng nhập nhanh bằng PIN cho thiết bị này');
  }
  updateBioNote();
  updateBioLoginVisibility();
}

function updateBioNote() {
  const note = $id('bio-note');
  if (!note) return;
  bioAvailable().then((ok) => {
    const email = state.user && state.user.email;
    const d = email ? bioGetAll()[email] : null;
    if (d && d.credId) note.textContent = 'Đang BẬT sinh trắc học cho ' + email + ' — màn hình đăng nhập sẽ có nút "Đăng nhập nhanh".';
    else if (d && d.pin) note.textContent = 'Đang BẬT đăng nhập nhanh bằng PIN cho ' + email + ' (thiết bị không hỗ trợ sinh trắc học).';
    else if (!ok) note.textContent = 'Thiết bị/trình duyệt này không hỗ trợ WebAuthn sinh trắc (ví dụ Chrome trên Xiaomi/Redmi). Khi bật, app sẽ tự đề nghị tạo PIN 4–6 số dự phòng để đăng nhập nhanh.';
    else note.textContent = 'Đang TẮT. Bật để đăng nhập nhanh bằng vân tay/khuôn mặt/PIN trên thiết bị này — nếu thiết bị không hỗ trợ, app sẽ dùng PIN dự phòng (cần nhập mật khẩu hiện tại bên trên).';
  });
}

/* ================= PASSWORD CHANGE ================= */

async function changePassword() {
  if (!isFirebase) { toast('🔒 Chỉ dùng được khi kết nối Firebase'); return; }
  const cur = $id('st-curpass').value;
  const nw = $id('st-newpass').value;
  const nw2 = $id('st-newpass2').value;
  if (!cur || !nw) { toast('⚠️ Nhập mật khẩu hiện tại và mật khẩu mới'); return; }
  if (nw.length < 6) { toast('⚠️ Mật khẩu mới tối thiểu 6 ký tự'); return; }
  if (nw !== nw2) { toast('⚠️ Mật khẩu nhập lại không khớp'); return; }
  const btn = $id('btn-changepass');
  btn.disabled = true;
  btn.textContent = '⏳ Đang xử lý...';
  try {
    const cred = firebase.auth.EmailAuthProvider.credential(state.user.email, cur);
    await firebase.auth().currentUser.reauthenticateWithCredential(cred);
    await firebase.auth().currentUser.updatePassword(nw);
    $id('st-curpass').value = '';
    $id('st-newpass').value = '';
    $id('st-newpass2').value = '';
    const all = bioGetAll();
    if (all[state.user.email]) {
      all[state.user.email].pwd = obfuscate(nw);
      localStorage.setItem(BIO_KEY, JSON.stringify(all));
    }
    toast('✅ Đã đổi mật khẩu thành công');
  } catch (err) {
    const code = (err && err.code) || '';
    if (code.indexOf('wrong-password') > -1 || code.indexOf('invalid-credential') > -1) toast('❌ Mật khẩu hiện tại không đúng');
    else if (code.indexOf('weak-password') > -1) toast('❌ Mật khẩu mới quá yếu (tối thiểu 6 ký tự)');
    else if (code.indexOf('requires-recent-login') > -1) toast('❌ Phiên đăng nhập đã cũ — hãy đăng xuất rồi đăng nhập lại');
    else if (code.indexOf('too-many-requests') > -1) toast('❌ Thử quá nhiều lần, đợi ít phút rồi thử lại');
    else toast('❌ Lỗi: ' + (err.message || 'không rõ'));
  } finally {
    btn.disabled = false;
    btn.textContent = '🔑 Đổi mật khẩu';
  }
}

/* ================= RENDER ================= */

function renderAll() {
  const app = $id('app');
  if (!state.user) {
    app.classList.add('hidden');
    return;
  }
  app.classList.remove('hidden');
  $id('header-owner').textContent = state.settings.owner;
  renderHero();
  renderStatCards();
  renderTrends();
  $id('empty-banner').classList.toggle('hidden', state.transactions.length > 0);
  renderTodayList();
  renderDetailTable();
  renderReport();
  if ($id('tab-dashboard').classList.contains('active')) renderCharts();
}

function renderHero() {
  const s = computeStats();
  $id('hero-total').textContent = fmtVND(s.total);
  $id('hero-week').textContent =
    `🔁 Tuần ${s.weekInCycle} của chu kỳ ${s.cycleWeeks} tuần · Bắt đầu từ ${fmtDateVN(state.settings.startDate)}`;
}

function renderStatCards() {
  const s = computeStats();
  const cards = [
    { icon: '💰', value: fmtVND(s.total), label: 'Tổng tiền tiết kiệm', cls: '' },
    { icon: '🧾', value: s.totalQty + ' tờ', label: 'Số tờ đang có', cls: 'gold' },
    { icon: '📆', value: s.activeDays + ' ngày', label: 'Số ngày đã tiết kiệm', cls: '' },
    { icon: '📊', value: fmtVND(s.avgWeek), label: `TB mỗi tuần (${s.weeksElapsed} tuần)`, cls: 'gold' },
    { icon: '📈', value: fmtVND(s.avgMonth), label: `TB mỗi tháng (${s.monthsElapsed} tháng)`, cls: '' },
    { icon: '🗓️', value: fmtVND(s.avgYear), label: `TB mỗi năm (${s.yearsElapsed} năm)`, cls: 'gold' }
  ];
  $id('stat-cards').innerHTML = cards.map((c) => `
    <div class="stat-card ${c.cls}">
      <div class="stat-icon">${c.icon}</div>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${c.label}</div>
    </div>
  `).join('');
}

function renderTrends() {
  const el = $id('trend-cards');
  if (!el) return;
  const defs = [
    { type: 'week', icon: '📅', label: 'Tuần này', prevLabel: 'tuần trước' },
    { type: 'month', icon: '🗓️', label: 'Tháng này', prevLabel: 'tháng trước' },
    { type: 'year', icon: '📈', label: 'Năm nay', prevLabel: 'năm trước' }
  ];
  el.innerHTML = defs.map((d) => {
    const periods = lastNPeriods(d.type, 2);
    const cur = sumPeriod(d.type, periods[1].key);
    const prev = sumPeriod(d.type, periods[0].key);
    const delta = cur.net - prev.net;
    let arrow = '⏱️';
    let cls = 'trend-flat';
    let txt = 'Ngang bằng ' + d.prevLabel;
    if (delta > 0) {
      arrow = '▲';
      cls = 'trend-up';
      txt = '+' + fmtCompact(delta) + ' vs ' + d.prevLabel;
    } else if (delta < 0) {
      arrow = '▼';
      cls = 'trend-down';
      txt = '−' + fmtCompact(Math.abs(delta)) + ' vs ' + d.prevLabel;
    }
    return `<div class="trend-card ${cls}">
      <div class="trend-head">${d.icon} ${d.label}</div>
      <div class="trend-net ${cur.net >= 0 ? 'tx-plus' : 'tx-minus'}">${fmtVND(cur.net)}</div>
      <div class="trend-delta">${arrow} ${escHtml(txt)}</div>
      <div class="trend-meta">${cur.count} giao dịch · Nạp ${fmtCompact(cur.nap)} · Rút ${fmtCompact(cur.rut)}</div>
    </div>`;
  }).join('');
}

function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderTodayList() {
  const today = todayStr();
  const list = state.transactions.filter((t) => t.date === today);
  const el = $id('today-list');
  if (!list.length) {
    el.innerHTML = '<div class="empty-note">Hôm nay chưa có giao dịch nào. Bấm nút bên trên để bắt đầu! 💪</div>';
    return;
  }
  el.innerHTML = list.map((t) => {
    const sign = t.type === 'nap' ? '+' : '-';
    const cat = t.type === 'nap' ? t.source : t.purpose;
    return `<div class="tx-row">
      <div><span class="${t.type === 'nap' ? 'tx-plus' : 'tx-minus'}">${sign} ${fmtVND(t.amount)}</span>
      <span class="tx-meta"> · ${fmtDenom(t.denom)} × ${t.qty}${cat ? ' · ' + escHtml(cat) : ''}</span></div>
      <div class="tx-meta">${escHtml(t.note || '')}</div>
    </div>`;
  }).join('');
}

function getFilteredTransactions() {
  const type = ($id('f-type').dataset.value || '').trim();
  const from = $id('f-from').dataset.iso || '';
  const to = $id('f-to').dataset.iso || '';
  const q = $id('f-search').value.trim().toLowerCase();
  return state.transactions.filter((t) => {
    if (type && t.type !== type) return false;
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    if (q) {
      const hay = ((t.source || '') + ' ' + (t.purpose || '') + ' ' + (t.note || '')).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });
}

function renderDetailTable() {
  const list = getFilteredTransactions();
  const body = $id('detail-body');
  if (!list.length) {
    body.innerHTML = '<tr><td colspan="8" class="empty-note">Không có giao dịch nào khớp bộ lọc.</td></tr>';
    $id('detail-summary').innerHTML = '';
    return;
  }
  let nap = 0, rut = 0;
  body.innerHTML = list.map((t) => {
    if (t.type === 'nap') nap += t.amount; else rut += t.amount;
    const cat = t.type === 'nap' ? t.source : t.purpose;
    return `<tr>
      <td>${fmtDateVN(t.date)}</td>
      <td><span class="tag ${t.type === 'nap' ? 'tag-nap' : 'tag-rut'}">${t.type === 'nap' ? 'Nạp' : 'Rút'}</span></td>
      <td class="num">${fmtDenom(t.denom)}</td>
      <td class="num">${t.qty}</td>
      <td class="num ${t.type === 'nap' ? 'tx-plus' : 'tx-minus'}"><b>${fmtVND(t.amount)}</b></td>
      <td>${escHtml(cat || '')}</td>
      <td>${escHtml(t.note || '')}</td>
      <td class="no-print">
        <button class="btn-sm" data-edit="${t.id}">✏️ Sửa</button>
        <button class="btn-sm del" data-del="${t.id}">🗑️</button>
      </td>
    </tr>`;
  }).join('');
  $id('detail-summary').innerHTML =
    `<span>Nạp: <span class="tx-plus">${fmtVND(nap)}</span></span>
     <span>Rút: <span class="tx-minus">${fmtVND(rut)}</span></span>
     <span>Ròng: ${fmtVND(nap - rut)}</span>
     <span>${list.length} giao dịch</span>`;
}

/* ================= TABS ================= */

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === 'tab-' + name));
  if (name === 'dashboard') renderCharts();
  if (name === 'baocao') {
    renderReport();
    if (typeof renderReportCharts === 'function') renderReportCharts();
  }
}

/* ================= TOAST & CONFIRM ================= */

function toast(msg) {
  const el = $id('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3000);
}

function askConfirm(msg, cb) {
  $id('confirm-msg').textContent = msg;
  confirmAction = cb;
  $id('modal-confirm').classList.remove('hidden');
}

/* ================= TX MODAL ================= */

function openTxModal(type, editId) {
  state.txMode = type;
  state.editId = editId || null;
  const editing = editId ? state.transactions.find((t) => t.id === editId) : null;
  $id('modal-tx-title').textContent = editing
    ? (type === 'nap' ? '✏️ Sửa giao dịch Nạp tiền' : '✏️ Sửa giao dịch Rút tiền')
    : (type === 'nap' ? '💰 NẠP TIỀN — Bỏ tiền vào heo đất' : '💸 RÚT TIỀN — Rút tiền từ heo đất');
  const denom = editing ? editing.denom : DENOMS[0];
  setCombo('tx-denom', String(denom), fmtDenom(denom));
  setDateField($id('tx-date'), editing ? editing.date : todayStr());
  setCombo('tx-source', editing ? (editing.source || '') : '', editing ? (editing.source || '') : '');
  setCombo('tx-purpose', editing ? (editing.purpose || '') : '', editing ? (editing.purpose || '') : '');
  $id('tx-qty').value = editing ? editing.qty : 1;
  $id('tx-note').value = editing ? (editing.note || '') : '';
  $id('tx-source-wrap').classList.toggle('hidden', type !== 'nap');
  $id('tx-purpose-wrap').classList.toggle('hidden', type !== 'rut');
  updateTxAmount();
  $id('modal-tx').classList.remove('hidden');
  $id('tx-qty').focus();
}

function closeTxModal() {
  $id('modal-tx').classList.add('hidden');
}

function updateTxAmount() {
  const amount = (parseInt($id('tx-denom').dataset.value, 10) || 0) * (parseInt($id('tx-qty').value, 10) || 0);
  $id('tx-amount').textContent = 'Thành tiền: ' + fmtVND(amount);
}

async function submitTxForm(e) {
  e.preventDefault();
  const qty = parseInt($id('tx-qty').value, 10);
  if (!qty || qty < 1) { toast('⚠️ Số lượng phải lớn hơn 0'); return; }
  const denom = parseInt($id('tx-denom').dataset.value, 10) || 0;
  if (!denom) { toast('⚠️ Hãy chọn mệnh giá'); return; }
  const data = {
    type: state.txMode,
    date: $id('tx-date').dataset.iso || todayStr(),
    denom: denom,
    qty: qty,
    amount: denom * qty,
    note: $id('tx-note').value.trim(),
    createdAt: new Date().toISOString()
  };
  if (state.txMode === 'nap') data.source = ($id('tx-source').dataset.value || '').trim() || 'Khác';
  else data.purpose = ($id('tx-purpose').dataset.value || '').trim() || 'Khác';
  try {
    if (state.editId) {
      await store.updateTransaction(state.editId, data);
      toast('✅ Đã cập nhật giao dịch');
    } else {
      await addTransaction(data);
      toast(state.txMode === 'nap' ? '💰 Đã nạp ' + fmtVND(data.amount) : '💸 Đã ghi nhận rút ' + fmtVND(data.amount));
    }
    if (!isFirebase) handleData(MockStore.init ? await MockStore.init() : null);
    closeTxModal();
  } catch (err) {
    toast('❌ Lỗi: ' + err.message);
  }
}

/* ================= SETTINGS ================= */

function openSettings() {
  const s = state.settings;
  $id('st-owner').value = s.owner;
  setDateField($id('st-start'), s.startDate);
  $id('st-cycle').value = s.cycleWeeks;
  $id('st-sources').value = (s.sources || []).join('\n');
  $id('st-purposes').value = (s.purposes || []).join('\n');
  const securityVisible = isFirebase;
  $id('st-security-divider').classList.toggle('hidden', !securityVisible);
  $id('st-curpass').parentElement.classList.toggle('hidden', !securityVisible);
  $id('st-newpass').parentElement.classList.toggle('hidden', !securityVisible);
  $id('st-newpass2').parentElement.classList.toggle('hidden', !securityVisible);
  $id('btn-changepass').classList.toggle('hidden', !securityVisible);
  $id('st-bio').parentElement.classList.toggle('hidden', !securityVisible);
  $id('bio-note').classList.toggle('hidden', !securityVisible);
  if (securityVisible) {
    const email = state.user && state.user.email;
    $id('st-bio').checked = !!(email && bioGetAll()[email]);
    updateBioNote();
  }
  $id('modal-settings').classList.remove('hidden');
}

async function submitSettings(e) {
  e.preventDefault();
  const lines = (v) => v.split('\n').map((x) => x.trim()).filter(Boolean);
  const settings = {
    owner: $id('st-owner').value.trim() || DEFAULT_SETTINGS.owner,
    startDate: $id('st-start').dataset.iso || SEED_DATE,
    cycleWeeks: parseInt($id('st-cycle').value, 10) || 9,
    theme: state.settings.theme || 'light',
    sources: lines($id('st-sources').value),
    purposes: lines($id('st-purposes').value)
  };
  try {
    await store.saveSettings(settings);
    if (!isFirebase) handleData(await MockStore.init());
    $id('modal-settings').classList.add('hidden');
    toast('✅ Đã lưu cài đặt');
  } catch (err) {
    toast('❌ Lỗi: ' + err.message);
  }
}

/* ================= AUTH ================= */

function onAuthChanged() {
  const loginScreen = $id('login-screen');
  if (state.user) {
    loginScreen.classList.add('hidden');
    if (!window.__authChecked) {
      window.__authChecked = true;
      if (!window.__freshLogin && typeof sessionExpired === 'function' && sessionExpired()) {
        if (typeof enforceSession === 'function') { enforceSession(); return; }
      }
    }
    if (typeof touchSession === 'function') touchSession();
    if (isFirebase) toast('👋 Xin chào, ' + (state.user.email || ''));
    renderAll();
  } else {
    loginScreen.classList.remove('hidden');
    $id('app').classList.add('hidden');
    updateBioLoginVisibility();
  }
}

function loginErrorText(err) {
  const code = (err && err.code) || '';
  if (code.indexOf('invalid-credential') > -1 || code.indexOf('wrong-password') > -1 || code.indexOf('user-not-found') > -1) {
    return 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
  }
  if (code.indexOf('too-many-requests') > -1) return 'Đăng nhập sai quá nhiều lần, thử lại sau ít phút.';
  if (code.indexOf('network') > -1) return 'Lỗi kết nối mạng.';
  return 'Không đăng nhập được: ' + (err && err.message ? err.message : 'lỗi không rõ');
}

/* ================= INIT UI ================= */

function bindUI() {
  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => switchTab(b.dataset.tab)));

  ['btn-open-nap', 'btn-open-nap-2'].forEach((id) => $id(id).addEventListener('click', () => openTxModal('nap')));
  ['btn-open-rut', 'btn-open-rut-2'].forEach((id) => $id(id).addEventListener('click', () => openTxModal('rut')));

  $id('tx-denom').addEventListener('combochange', updateTxAmount);
  $id('tx-qty').addEventListener('input', updateTxAmount);
  $id('tx-cancel').addEventListener('click', closeTxModal);
  $id('tx-form').addEventListener('submit', submitTxForm);
  $id('modal-tx').addEventListener('click', (e) => { if (e.target === $id('modal-tx')) closeTxModal(); });

  document.querySelectorAll('.combo').forEach((c) => {
    const input = c.querySelector('.combo-input');
    const btn = c.querySelector('.combo-btn');
    input.addEventListener('click', (e) => {
      e.stopPropagation();
      if (input.readOnly) openCombo(c);
    });
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = c.querySelector('.combo-menu');
      if (menu.classList.contains('hidden')) openCombo(c);
      else closeCombos();
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.combo')) closeCombos();
  });

  document.querySelectorAll('.date-wrap').forEach((w) => {
    w.addEventListener('click', () => {
      const f = w.querySelector('.date-field');
      if (f) openDatePicker(f);
    });
  });
  $id('cal-prev').addEventListener('click', () => calShift(-1));
  $id('cal-next').addEventListener('click', () => calShift(1));
  $id('cal-close').addEventListener('click', closeDatePicker);
  $id('cal-today').addEventListener('click', () => pickDate(todayStr()));
  $id('cal-clear').addEventListener('click', () => {
    if (dateTarget && dateTarget.dataset.optional) {
      setDateField(dateTarget, '');
      dateTarget.dispatchEvent(new Event('datechange', { bubbles: true }));
    }
    closeDatePicker();
  });
  $id('modal-date').addEventListener('click', (e) => { if (e.target === $id('modal-date')) closeDatePicker(); });

  $id('pin-ok').addEventListener('click', confirmPin);
  $id('pin-cancel').addEventListener('click', () => closePinModal(null));
  ['pin-input', 'pin-input2'].forEach((id) => {
    $id(id).addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (id === 'pin-input' && pinMode === 'setup' && !$id('pin-input2').classList.contains('hidden')) {
          $id('pin-input2').focus();
        } else {
          confirmPin();
        }
      }
    });
  });
  $id('modal-pin').addEventListener('click', (e) => { if (e.target === $id('modal-pin')) closePinModal(null); });

  $id('btn-settings').addEventListener('click', openSettings);
  $id('btn-theme').addEventListener('click', toggleTheme);
  $id('btn-changepass').addEventListener('click', changePassword);
  $id('st-bio').addEventListener('change', (e) => toggleBioSetting(e.target.checked));
  $id('btn-bio-login').addEventListener('click', bioLogin);
  $id('st-cancel').addEventListener('click', () => $id('modal-settings').classList.add('hidden'));
  $id('settings-form').addEventListener('submit', submitSettings);
  $id('modal-settings').addEventListener('click', (e) => { if (e.target === $id('modal-settings')) $id('modal-settings').classList.add('hidden'); });

  $id('confirm-no').addEventListener('click', () => {
    confirmAction = null;
    $id('modal-confirm').classList.add('hidden');
  });
  $id('confirm-yes').addEventListener('click', () => {
    const cb = confirmAction;
    confirmAction = null;
    $id('modal-confirm').classList.add('hidden');
    if (cb) cb();
  });

  $id('btn-seed').addEventListener('click', () => {
    askConfirm('Nạp dữ liệu kiểm kê ngày 01/11/2026 (6.442.000 ₫ · 83 tờ) làm dữ liệu ban đầu?', async () => {
      try {
        await store.seedInventory();
        if (!isFirebase) handleData(await MockStore.init());
        toast('✅ Đã nạp dữ liệu kiểm kê ban đầu');
      } catch (err) {
        toast('❌ Lỗi: ' + err.message);
      }
    });
  });

  $id('f-type').addEventListener('combochange', renderDetailTable);
  ['f-from', 'f-to'].forEach((id) => $id(id).addEventListener('datechange', renderDetailTable));
  $id('f-search').addEventListener('input', renderDetailTable);
  $id('f-clear').addEventListener('click', () => {
    setCombo('f-type', '', '');
    setDateField($id('f-from'), '');
    setDateField($id('f-to'), '');
    $id('f-search').value = '';
    renderDetailTable();
  });

  $id('detail-body').addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    const delBtn = e.target.closest('[data-del]');
    if (editBtn) {
      const tx = state.transactions.find((t) => t.id === editBtn.dataset.edit);
      if (tx) openTxModal(tx.type, tx.id);
    }
    if (delBtn) {
      const id = delBtn.dataset.del;
      const tx = state.transactions.find((t) => t.id === id);
      askConfirm('Xóa giao dịch ' + (tx ? fmtVND(tx.amount) + ' ngày ' + fmtDateVN(tx.date) : '') + '?', async () => {
        try {
          await store.deleteTransaction(id);
          if (!isFirebase) handleData(await MockStore.init());
          toast('🗑️ Đã xóa giao dịch');
        } catch (err) {
          toast('❌ Lỗi: ' + err.message);
        }
      });
    }
  });

  $id('btn-email').addEventListener('click', sendEmailReport);
  $id('btn-copy').addEventListener('click', copyReport);
  $id('btn-csv').addEventListener('click', exportCSV);
  $id('btn-xlsx').addEventListener('click', exportXLSX);
  $id('btn-print').addEventListener('click', () => {
    fillPrintMeta();
    const wasDark = isDarkTheme();
    if (wasDark) applyTheme('light', false);
    const restore = () => {
      if (wasDark) applyTheme('dark', false);
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    setTimeout(() => window.print(), 80);
  });

  $id('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = $id('login-error');
    errEl.classList.add('hidden');
    const btn = $id('login-btn');
    btn.disabled = true;
    btn.textContent = 'Đang đăng nhập...';
    window.__freshLogin = true;
    try {
      await store.signIn($id('login-email').value.trim(), $id('login-pass').value);
      window.__freshLogin = false;
    } catch (err) {
      window.__freshLogin = false;
      errEl.textContent = loginErrorText(err);
      errEl.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Đăng nhập';
    }
  });

  $id('btn-logout').addEventListener('click', async () => {
    if (!isFirebase) {
      toast('🔒 Chế độ demo — chưa kết nối Firebase');
      return;
    }
    try {
      await store.signOut();
      toast('👋 Đã đăng xuất');
    } catch (err) {
      toast('❌ Lỗi: ' + err.message);
    }
  });
}

/* ================= APP INIT ================= */

function initApp() {
  initTheme();
  bindUI();
  if (!isFirebase) {
    store = MockStore;
    state.user = { email: 'demo@local' };
    MockStore.init().then(handleData);
    renderAll();
  } else {
    store = FirebaseStore;
    FirebaseStore.watch(handleData, (err) => toast('❌ Lỗi dữ liệu: ' + err.message));
  }
}
