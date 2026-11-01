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

document.addEventListener('DOMContentLoaded', initApp);
