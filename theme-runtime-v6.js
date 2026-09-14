(function () {
  'use strict';

  const THEME_KEY = 'pm01-theme-v1';
  const root = document.documentElement;
  const media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function storedTheme() {
    try {
      const value = localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch (_) { return null; }
  }

  function preferredTheme() {
    return storedTheme() || (media?.matches ? 'light' : 'dark');
  }

  function updateMeta(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f5f1e7' : '#0a0a0a');
  }

  function updateButtons(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const next = theme === 'light' ? 'dark' : 'light';
      button.textContent = next === 'light' ? 'Светлая тема' : 'Тёмная тема';
      button.setAttribute('aria-label', `Переключить на ${next === 'light' ? 'светлую' : 'тёмную'} тему`);
      button.setAttribute('aria-pressed', String(theme === 'light'));
    });
  }

  function applyTheme(theme, persist = false) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    updateMeta(theme);
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    }
    updateButtons(theme);
  }

  function button(extraClass = '') {
    const control = document.createElement('button');
    control.type = 'button';
    control.className = `theme-toggle button subtle ${extraClass}`.trim();
    control.dataset.themeToggle = '';
    control.addEventListener('click', () => applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true));
    return control;
  }

  function ensureControls() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && !sidebar.querySelector('[data-theme-toggle]')) sidebar.insertBefore(button(), sidebar.querySelector('.sidebar-note') || null);

    const mobileHeader = document.querySelector('.mobile-header');
    if (mobileHeader && !mobileHeader.querySelector('[data-theme-toggle]')) mobileHeader.insertBefore(button('theme-toggle-mobile'), mobileHeader.querySelector('.menu-button') || null);

    const simulatorNav = document.querySelector('.sim-standalone-nav');
    if (simulatorNav && !simulatorNav.querySelector('[data-theme-toggle]')) simulatorNav.insertBefore(button('theme-toggle-simulator'), simulatorNav.querySelector('.sim-back') || null);

    updateButtons(root.dataset.theme || preferredTheme());
  }

  applyTheme(preferredTheme(), false);

  function start() {
    ensureControls();
    const observer = new MutationObserver(ensureControls);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.PM01ThemeV6 = Object.freeze({ applyTheme, preferredTheme });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();
