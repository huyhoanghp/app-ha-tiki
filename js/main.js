'use strict';

(function () {
  try {
    const t = localStorage.getItem('tk_theme');
    if (t) document.documentElement.dataset.theme = t;
  } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', initApp);
