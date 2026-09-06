const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const appCode = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function storageFrom(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

function classListStub() {
  return { add() {}, remove() {}, toggle() { return false; } };
}

function runBaseApp(route, legacyState = {}) {
  const main = { innerHTML: '', focus() {} };
  const sidebarProgress = { innerHTML: '' };
  const mobileNav = { classList: classListStub() };
  const menuButton = { classList: classListStub(), addEventListener() {}, setAttribute() {} };
  const notes = { value: '' };
  const criterion = { checked: false, dataset: { criterion: '0' }, addEventListener() {} };
  const completeButton = {
    textContent: '',
    disabled: false,
    classList: classListStub(),
    listeners: {},
    addEventListener(type, callback) { this.listeners[type] = callback; },
  };
  const saveNotes = { addEventListener() {} };
  const toast = { textContent: '', classList: classListStub() };

  const document = {
    querySelector(selector) {
      if (selector === '#main') return main;
      if (selector === '#sidebar-progress') return sidebarProgress;
      if (selector === '#mobile-nav') return mobileNav;
      if (selector === '#menu-button') return menuButton;
      if (selector === '#lesson-notes') return notes;
      if (selector === '#complete-lesson') return completeButton;
      if (selector === '#save-notes') return saveNotes;
      if (selector === '#toast') return toast;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-criterion]') return [criterion];
      if (selector === '[data-criterion]:checked') return criterion.checked ? [criterion] : [];
      return [];
    },
  };

  const localStorage = storageFrom({
    'pm01-state-v1': JSON.stringify({
      completed: [], notes: {}, criteria: {}, lastLesson: null, diagnostic: {}, ...legacyState,
    }),
  });

  const window = {
    PM01: {
      flows: [], diagnostics: [], tools: [],
      modules: [
        { id: 'm01', title: 'Модуль 1', duration: '1–2 ч', outcome: 'Результат 1', lessons: [
          { id: 'a', title: 'Урок A', thesis: 'Тезис A', minutes: 10, body: ['Текст'], model: 'Модель', practice: ['Шаг'], criteria: ['Есть доказательство'] },
        ] },
        { id: 'm02', title: 'Модуль 2', duration: '1–2 ч', outcome: 'Результат 2', lessons: [
          { id: 'b', title: 'Урок B', thesis: 'Тезис B', minutes: 10, body: ['Текст'], model: 'Модель', practice: ['Шаг'], criteria: ['Есть доказательство'] },
        ] },
      ],
    },
    addEventListener() {},
    scrollTo() {},
  };
  const location = { hash: `#/${route}` };
  const context = { window, document, localStorage, location, console, Blob, URL, setTimeout() { return 1; }, clearTimeout() {} };
  vm.createContext(context);
  vm.runInContext(appCode, context, { filename: 'app.js' });

  return { main, completeButton, criterion, location, localStorage };
}

test('lesson completion clearly stays unavailable until every evidence criterion is checked', () => {
  const { main } = runBaseApp('lesson/a');
  assert.match(main.innerHTML, /0\/1 выполнено/);
  assert.match(main.innerHTML, /id="complete-lesson"[^>]*disabled/);
});

test('completing a ready lesson records progress and advances to the next lesson', () => {
  const { completeButton, location, localStorage } = runBaseApp('lesson/a', { criteria: { a: [0] } });
  assert.equal(typeof completeButton.listeners.click, 'function');
  completeButton.listeners.click({ currentTarget: completeButton });
  const saved = JSON.parse(localStorage.getItem('pm01-state-v1'));
  assert.deepEqual(saved.completed, ['a']);
  assert.equal(location.hash, '#/lesson/b');
});

test('course view presents one primary learning path', () => {
  const { main } = runBaseApp('course');
  assert.match(main.innerHTML, /Основной путь/);
  assert.doesNotMatch(main.innerHTML, /Не линейный курс/);
});
