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
  };
}

function classListStub() {
  return { add() {}, remove() {}, toggle() { return false; } };
}

function run(route, state) {
  const main = { innerHTML: '', focus() {} };
  const sidebarProgress = { innerHTML: '' };
  const mobileNav = { classList: classListStub() };
  const menuButton = { addEventListener() {}, setAttribute() {} };
  const toast = { textContent: '', classList: classListStub() };

  const document = {
    querySelector(selector) {
      if (selector === '#main') return main;
      if (selector === '#sidebar-progress') return sidebarProgress;
      if (selector === '#mobile-nav') return mobileNav;
      if (selector === '#menu-button') return menuButton;
      if (selector === '#toast') return toast;
      return null;
    },
    querySelectorAll() { return []; },
  };

  const localStorage = storageFrom({ 'pm01-state-v1': JSON.stringify(state) });
  const lesson = {
    id: 'lab-a',
    title: 'Lab A',
    thesis: 'Тезис',
    minutes: 15,
    body: [],
    model: '',
    practice: [],
    criteria: [],
    learningLab: {
      skill: 'Проверять решение через обязательный кейс и рабочий инструмент.',
      technique: { name: 'Technique', purpose: 'Purpose', steps: ['Step'], model: 'MODEL' },
      workedExample: { title: 'Example', steps: ['Example step'] },
      drills: [{
        id: 'd1', stage: 'cold', required: true, title: 'Case', situation: 'Situation', prompt: 'Decision?',
        options: [{ id: 'ok', label: 'Option', feedback: 'Feedback', score: 3 }],
      }],
      workbookTitle: 'Workbook',
      workbookFields: [{ id: 'field1', label: 'Evidence', prompt: 'Add evidence', required: true }],
      transferPrompt: 'Apply to a real project.',
    },
  };

  const window = {
    PM01: {
      flows: [], diagnostics: [], tools: [],
      modules: [{ id: 'm01', title: 'M01', duration: '1 ч', outcome: 'Outcome', lessons: [lesson] }],
    },
    addEventListener() {}, scrollTo() {},
  };
  const location = { hash: `#/${route}` };
  const context = { window, document, localStorage, location, console, Blob, URL, setTimeout() { return 1; }, clearTimeout() {} };
  vm.createContext(context);
  vm.runInContext(appCode, context, { filename: 'app.js' });
  return { main, sidebarProgress };
}

function baseState(overrides = {}) {
  return {
    completed: [], notes: {}, criteria: {}, lastLesson: null, diagnostic: {}, lab: {},
    ...overrides,
  };
}

test('legacy completed flag does not bypass current Learning Lab evidence', () => {
  const { main } = run('lesson/lab-a', baseState({ completed: ['lab-a'] }));
  assert.match(main.innerHTML, /0\/1 решений · 0\/1 полей/);
  assert.match(main.innerHTML, /id="complete-lesson"[^>]*disabled/);
  assert.doesNotMatch(main.innerHTML, /Вернуться к программе →/);
});

test('course progress excludes a stale Learning Lab completion without current evidence', () => {
  const { main, sidebarProgress } = run('course', baseState({ completed: ['lab-a'] }));
  assert.match(main.innerHTML, /<strong>0%<\/strong>/);
  assert.match(main.innerHTML, /<strong>0\/1<\/strong>/);
  assert.match(sidebarProgress.innerHTML, />0%</);
});

test('Learning Lab completion remains valid when current required evidence is present', () => {
  const state = baseState({
    completed: ['lab-a'],
    lab: { 'lab-a': { drillAnswers: { d1: 'ok' }, workbook: { field1: 'fact' } } },
  });
  const { main } = run('course', state);
  assert.match(main.innerHTML, /<strong>100%<\/strong>/);
  assert.match(main.innerHTML, /<strong>1\/1<\/strong>/);
});
