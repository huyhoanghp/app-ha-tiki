'use strict';

(function () {
  try {
    const t = localStorage.getItem('tk_theme');
    if (t) document.documentElement.dataset.theme = t;
  } catch (e) {}
})();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

const SESSION_KEY = 'tk_last_active';
const SESSION_TIMEOUT = 5 * 60 * 1000;

function touchSession() {
  try { localStorage.setItem(SESSION_KEY, String(Date.now())); } catch (e) {}
}

function sessionExpired() {
  let last = 0;
  try { last = parseInt(localStorage.getItem(SESSION_KEY), 10) || 0; } catch (e) {}
  return last > 0 && (Date.now() - last) > SESSION_TIMEOUT;
}

async function enforceSession() {
  if (!state.user) return;
  document.querySelectorAll('.modal-backdrop').forEach((m) => m.classList.add('hidden'));
  try {
    await store.signOut();
    toast('🔒 Bạn đã rời app quá 5 phút — vui lòng đăng nhập lại');
  } catch (e) {}
}

function initSessionGuard() {
  if (!isFirebase) return;
  [800, 2500, 5000].forEach((d) => setTimeout(() => {
    if (state.user && sessionExpired()) enforceSession();
  }, d));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      touchSession();
    } else if (state.user) {
      if (sessionExpired()) enforceSession();
      else touchSession();
    }
  });
  setInterval(() => { if (!document.hidden && state.user) touchSession(); }, 30000);
  window.addEventListener('pagehide', touchSession);
  window.addEventListener('beforeunload', touchSession);
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initSessionGuard();
});
