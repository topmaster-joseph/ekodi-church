// A local, accessible tab interface: never fetches private Person data or broadens server roles.
(() => {
  'use strict';
  const root = document.getElementById('memberTabs');
  const header = document.querySelector('header.site-header');
  if (!root) return;
  const tabs = [...root.querySelectorAll('[data-member-tab]')];
  const kinds = new Set(tabs.map(node => node.dataset.memberTab));
  const attendance = [...document.querySelectorAll('[data-attendance-tab]')];
  const attendanceKinds = new Set(attendance.map(node => node.dataset.attendanceTab));

  function selectGroup(buttons, name, dataKey, panelPrefix) {
    if (!buttons.some(item => item.dataset[dataKey] === name)) return false;
    for (const button of buttons) {
      const selected = button.dataset[dataKey] === name;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(panelPrefix + button.dataset[dataKey]);
      if (panel) panel.hidden = !selected;
    }
    return true;
  }
  function scrollTabsToTop() {
    const offset = header?.getBoundingClientRect().height || 0;
    const top = root.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  }
  function selectMain(name, { scroll = false, updateUrl = false } = {}) {
    if (!kinds.has(name)) name = 'worship';
    selectGroup(tabs, name, 'memberTab', 'panel-');
    if (updateUrl) {
      const next = new URL(location.href);
      if (name === 'worship') next.searchParams.delete('tab');
      else next.searchParams.set('tab', name);
      // Preserve any existing handoff query and do not add identity to URL.
      history.replaceState(history.state, '', next.pathname + next.search + next.hash);
    }
    if (scroll) scrollTabsToTop();
  }
  function selectAttendance(name) {
    if (attendanceKinds.has(name)) selectGroup(attendance, name, 'attendanceTab', 'attendance-panel-');
  }
  function keyboard(event, buttons, key, activate) {
    const index = buttons.indexOf(event.currentTarget);
    if (index < 0) return;
    const next = event.key === 'ArrowRight' || event.key === 'ArrowDown'
      ? (index + 1) % buttons.length
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
        ? (index + buttons.length - 1) % buttons.length
        : event.key === 'Home' ? 0
          : event.key === 'End' ? buttons.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    buttons[next].focus();
    activate(buttons[next].dataset[key]);
  }
  tabs.forEach(button => {
    button.addEventListener('click', () => selectMain(button.dataset.memberTab, { scroll: true, updateUrl: true }));
    button.addEventListener('keydown', event => keyboard(event, tabs, 'memberTab', name =>
      selectMain(name, { scroll: true, updateUrl: true })));
  });
  attendance.forEach(button => {
    button.addEventListener('click', () => selectAttendance(button.dataset.attendanceTab));
    button.addEventListener('keydown', event => keyboard(event, attendance, 'attendanceTab', selectAttendance));
  });
  document.querySelectorAll('.church-mobile-nav nav a').forEach(link =>
    link.addEventListener('click', () => { const menu = link.closest('details'); if (menu) menu.open = false; }));
  window.addEventListener('popstate', () => {
    const next = new URLSearchParams(location.search).get('tab');
    selectMain(next);
  });
  selectMain(new URLSearchParams(location.search).get('tab'));
  selectAttendance('service');
})();
