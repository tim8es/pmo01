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

  function updateControls(theme) {
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const next = theme === 'light' ? 'dark' : 'light';
      button.textContent = next === 'light' ? 'Светлая тема' : 'Тёмная тема';
      button.setAttribute('aria-label', `Переключить на ${next === 'light' ? 'светлую' : 'тёмную'} тему`);
      button.setAttribute('aria-pressed', String(theme === 'light'));
    });
  }

  function applyTheme(theme, persist = false) {
    const value = theme === 'light' ? 'light' : 'dark';
    root.dataset.theme = value;
    root.style.colorScheme = value;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', value === 'light' ? '#f5f1e7' : '#0a0a0a');
    if (persist) {
      try { localStorage.setItem(THEME_KEY, value); } catch (_) {}
    }
    updateControls(value);
  }

  function bind() {
    updateControls(root.dataset.theme || preferredTheme());
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      if (button.dataset.themeBound === 'true') return;
      button.dataset.themeBound = 'true';
      button.addEventListener('click', () => applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light', true));
    });
  }

  applyTheme(preferredTheme());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true }); else bind();

  window.PM01ThemeV7 = Object.freeze({ applyTheme, preferredTheme, bind });
})();
