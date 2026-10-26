(() => {
  'use strict';
  const menu = document.getElementById('churchShellMenu');
  const nav = document.getElementById('churchShellNav');
  if (!menu || !nav) return;
  menu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    nav.classList.remove('open');
    menu.setAttribute('aria-expanded','false');
  });
})();
