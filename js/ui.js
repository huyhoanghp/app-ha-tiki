'use strict';

let toastTimer = null;
let confirmAction = null;

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

/* ================= BIOMETRIC (WebAuthn) ================= */

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

function updateBioLoginVisibility() {
  const wrap = $id('bio-login-wrap');
  if (!wrap) return;
  const entries = Object.entries(bioGetAll());
  if (entries.length) {
    const [email] = entries[0];
    wrap.classList.remove('hidden');
    $id('bio-login-email').textContent = '🔐 ' + email;
  } else {
    wrap.classList.add('hidden');
  }
}

async function bioLogin() {
  const entries = Object.entries(bioGetAll());
  if (!entries.length) return;
  const [email, data] = entries[0];
  const btn = $id('btn-bio-login');
  try {
    btn.disabled = true;
    btn.textContent = '⏳ Đang xác thực...';
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: challenge,
        allowCredentials: [{ id: b64urlDecode(data.credId), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000
      }
    });
    if (assertion) {
      $id('login-email').value = email;
      $id('login-pass').value = deobfuscate(data.pwd);
      $id('login-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  } catch (err) {
    toast('❌ Xác thực sinh trắc không thành công');
  } finally {
    btn.disabled = false;
    btn.textContent = '👆 Đăng nhập bằng sinh trắc học';
  }
}

async function toggleBioSetting(enabled) {
  if (!isFirebase) { $id('st-bio').checked = false; toast('🔒 Chỉ dùng được khi kết nối Firebase'); return; }
  const email = state.user && state.user.email;
  if (!email) return;
  if (!enabled) {
    bioRemove(email);
    toast('✅ Đã tắt đăng nhập bằng sinh trắc học trên thiết bị này');
    updateBioNote();
    return;
  }
  if (!(await bioAvailable())) {
    $id('st-bio').checked = false;
    toast('❌ Thiết bị này không hỗ trợ sinh trắc học (Windows Hello / Touch ID)');
    updateBioNote();
    return;
  }
  const pwd = $id('st-curpass').value;
  if (!pwd) {
    $id('st-bio').checked = false;
    toast('⚠️ Nhập "Mật khẩu hiện tại" bên trên trước khi bật sinh trắc học');
    return;
  }
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: challenge,
        rp: { name: 'App Tiet Kiem' },
        user: {
          id: crypto.getRandomValues(new Uint8Array(16)),
          name: email,
          displayName: state.settings.owner || email
        },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred'
        },
        timeout: 60000,
        attestation: 'none'
      }
    });
    bioSet(email, { credId: b64urlEncode(cred.rawId), pwd: obfuscate(pwd) });
    toast('✅ Đã bật đăng nhập bằng sinh trắc học trên thiết bị này');
    updateBioNote();
    updateBioLoginVisibility();
  } catch (err) {
    $id('st-bio').checked = false;
    toast('❌ Không bật được sinh trắc học: ' + (err.message || 'bị hủy'));
  }
}

function updateBioNote() {
  const note = $id('bio-note');
  if (!note) return;
  bioAvailable().then((ok) => {
    const email = state.user && state.user.email;
    const on = email && !!bioGetAll()[email];
    if (!ok) note.textContent = 'Thiết bị/trình duyệt này không hỗ trợ WebAuthn sinh trắc. Dùng Chrome/Edge trên máy có Windows Hello, hoặc iPhone (Safari) có Face ID/Touch ID.';
    else if (on) note.textContent = 'Đang BẬT cho ' + email + ' — ở màn hình đăng nhập sẽ có nút đăng nhập bằng sinh trắc học.';
    else note.textContent = 'Đang TẮT. Bật để đăng nhập nhanh bằng vân tay/khuôn mặt/PIN trên thiết bị này (cần nhập mật khẩu hiện tại bên trên).';
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
  $id('empty-banner').classList.toggle('hidden', state.transactions.length > 0);
  renderDatalists();
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

function renderDatalists() {
  $id('dl-sources').innerHTML = state.settings.sources.map((s) => `<option value="${escHtml(s)}">`).join('');
  $id('dl-purposes').innerHTML = state.settings.purposes.map((s) => `<option value="${escHtml(s)}">`).join('');
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
  const type = $id('f-type').value;
  const from = $id('f-from').value;
  const to = $id('f-to').value;
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
  if (name === 'baocao') renderReport();
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
  $id('tx-denom').innerHTML = DENOMS.map((d) => `<option value="${d}">${fmtDenom(d)}</option>`).join('');
  $id('tx-date').value = editing ? editing.date : todayStr();
  $id('tx-denom').value = editing ? editing.denom : DENOMS[0];
  $id('tx-qty').value = editing ? editing.qty : 1;
  $id('tx-source').value = editing ? (editing.source || '') : '';
  $id('tx-purpose').value = editing ? (editing.purpose || '') : '';
  $id('tx-note').value = editing ? (editing.note || '') : '';
  $id('tx-source-wrap').classList.toggle('hidden', type !== 'nap');
  $id('tx-purpose-wrap').classList.toggle('hidden', type !== 'rut');
  updateTxAmount();
  $id('modal-tx').classList.remove('hidden');
  if (type === 'nap') $id('tx-source').focus(); else $id('tx-purpose').focus();
}

function closeTxModal() {
  $id('modal-tx').classList.add('hidden');
}

function updateTxAmount() {
  const amount = (parseInt($id('tx-denom').value, 10) || 0) * (parseInt($id('tx-qty').value, 10) || 0);
  $id('tx-amount').textContent = 'Thành tiền: ' + fmtVND(amount);
}

async function submitTxForm(e) {
  e.preventDefault();
  const qty = parseInt($id('tx-qty').value, 10);
  if (!qty || qty < 1) { toast('⚠️ Số lượng phải lớn hơn 0'); return; }
  const denom = parseInt($id('tx-denom').value, 10);
  const data = {
    type: state.txMode,
    date: $id('tx-date').value || todayStr(),
    denom: denom,
    qty: qty,
    amount: denom * qty,
    note: $id('tx-note').value.trim(),
    createdAt: new Date().toISOString()
  };
  if (state.txMode === 'nap') data.source = $id('tx-source').value.trim() || 'Khác';
  else data.purpose = $id('tx-purpose').value.trim() || 'Khác';
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
  $id('st-start').value = s.startDate;
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
    startDate: $id('st-start').value || SEED_DATE,
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

  $id('tx-denom').addEventListener('change', updateTxAmount);
  $id('tx-qty').addEventListener('input', updateTxAmount);
  $id('tx-cancel').addEventListener('click', closeTxModal);
  $id('tx-form').addEventListener('submit', submitTxForm);
  $id('modal-tx').addEventListener('click', (e) => { if (e.target === $id('modal-tx')) closeTxModal(); });

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

  ['f-type', 'f-from', 'f-to', 'f-search'].forEach((id) => $id(id).addEventListener('input', renderDetailTable));
  $id('f-clear').addEventListener('click', () => {
    $id('f-type').value = '';
    $id('f-from').value = '';
    $id('f-to').value = '';
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
  $id('btn-print').addEventListener('click', () => window.print());

  $id('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errEl = $id('login-error');
    errEl.classList.add('hidden');
    const btn = $id('login-btn');
    btn.disabled = true;
    btn.textContent = 'Đang đăng nhập...';
    try {
      await store.signIn($id('login-email').value.trim(), $id('login-pass').value);
    } catch (err) {
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
