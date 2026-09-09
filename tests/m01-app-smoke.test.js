const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const domain = require('../learning-domain.js');
const baseAppCode = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const validationDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-data.js'), 'utf8');
const validationAppCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-app.js'), 'utf8');

function storageFrom(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

function runValidationApp(route, initialStorage = {}) {
  const main = { innerHTML: '', focus() {} };
  const moduleList = {
    inserted: '',
    insertAdjacentHTML(_position, html) { this.inserted = html; },
  };
  const document = {
    querySelector(selector) {
      if (selector === '#main') return main;
      if (selector === '.module-list') return moduleList;
      return null;
    },
    querySelectorAll() { return []; },
  };
  const localStorage = storageFrom(initialStorage);
  const window = {
    PM01: {},
    PM01Learning: domain,
    addEventListener() {},
    confirm() { return true; },
  };
  const context = {
    window,
    document,
    localStorage,
    location: { hash: `#/${route}` },
    queueMicrotask(callback) { callback(); },
    console,
    Date,
  };
  vm.createContext(context);
  vm.runInContext(validationDataCode, context, { filename: 'm01-validation-data.js' });
  vm.runInContext(validationAppCode, context, { filename: 'm01-validation-app.js' });
  return { main, moduleList, localStorage };
}

function runHashchangeOwnershipHandoff() {
  const main = { innerHTML: '', focus() {} };
  const sidebarProgress = { innerHTML: '' };
  const mobileNav = { classList: { remove() {}, toggle() { return false; } } };
  const menuButton = { addEventListener() {}, setAttribute() {} };
  const listeners = { hashchange: [] };
  const microtasks = [];
  const document = {
    querySelector(selector) {
      if (selector === '#main') return main;
      if (selector === '#sidebar-progress') return sidebarProgress;
      if (selector === '#mobile-nav') return mobileNav;
      if (selector === '#menu-button') return menuButton;
      return null;
    },
    querySelectorAll() { return []; },
  };
  const localStorage = storageFrom();
  const window = {
    PM01: { modules: [], flows: [], diagnostics: [], tools: [] },
    PM01Learning: domain,
    addEventListener(type, callback) {
      if (!listeners[type]) listeners[type] = [];
      listeners[type].push(callback);
    },
    scrollTo() {},
    confirm() { return true; },
  };
  const context = {
    window,
    document,
    localStorage,
    location: { hash: '#/unknown' },
    queueMicrotask(callback) { microtasks.push(callback); },
    console,
    Date,
  };
  vm.createContext(context);
  vm.runInContext(validationDataCode, context, { filename: 'm01-validation-data.js' });
  vm.runInContext(baseAppCode, context, { filename: 'app.js' });
  vm.runInContext(validationAppCode, context, { filename: 'm01-validation-app.js' });

  assert.equal(listeners.hashchange.length, 2, 'base and extension hashchange handlers must both be registered');
  main.innerHTML = 'sentinel-before-validation';
  context.location.hash = '#/validation/m01';

  listeners.hashchange[0]();
  const afterBaseRouter = main.innerHTML;

  listeners.hashchange[1]();
  while (microtasks.length) microtasks.shift()();

  return { afterBaseRouter, afterExtension: main.innerHTML };
}

test('fresh validation route renders baseline without exposing simulator treatment or post-case controls', () => {
  const { main } = runValidationApp('validation/m01');

  assert.match(main.innerHTML, /01 · Baseline/);
  assert.match(main.innerHTML, /data-submit-assessment="baseline"/);
  assert.doesNotMatch(main.innerHTML, /#\/mission\/m01/);
  assert.doesNotMatch(main.innerHTML, /data-submit-assessment="postCase"/);
});

test('submitted baseline points learner to the pinned M01 simulator without exposing legacy lesson treatment', () => {
  const validationState = {
    version: 1,
    baseline: {
      answers: {},
      reasoning: 'Исходный диагноз уже был зафиксирован ранее.',
      submittedAt: '2026-09-06T12:00:00.000Z',
      score: { total: 5, max: 15, byDimension: {}, answered: 5 },
    },
  };
  const { main } = runValidationApp('validation/m01', {
    'pm01-validation-m01-v1': JSON.stringify(validationState),
  });

  assert.match(main.innerHTML, /#\/mission\/m01/);
  assert.match(main.innerHTML, /симулятор|мисси/i);
  assert.doesNotMatch(main.innerHTML, /#\/lesson\/project-system/);
  assert.doesNotMatch(main.innerHTML, /#\/lesson\/system-diagnostic/);
});

test('submitted baseline stays blind: score and option feedback are hidden until post-case is complete', () => {
  const validationState = {
    version: 1,
    baseline: {
      answers: { 'baseline-mechanism': 'people' },
      reasoning: 'Я зафиксировал исходный диагноз до изучения материала.',
      submittedAt: '2026-09-06T12:00:00.000Z',
      score: { total: 0, max: 15, byDimension: { mechanism: 0 }, answered: 5 },
    },
  };
  const { main } = runValidationApp('validation/m01', {
    'pm01-validation-m01-v1': JSON.stringify(validationState),
  });

  assert.doesNotMatch(main.innerHTML, /итог по rubric/);
  assert.doesNotMatch(main.innerHTML, /Это объясняет проблему качествами людей/);
  assert.match(main.innerHTML, /результат скрыт до post-case/);
});

test('course route receives a single M01 validation CTA from the extension', () => {
  const { moduleList } = runValidationApp('course');

  assert.match(moduleList.inserted, /data-validation-cta/);
  assert.match(moduleList.inserted, /#\/validation\/m01/);
});

test('hashchange hands validation/m01 to the extension without base-router DOM overwrite', () => {
  const { afterBaseRouter, afterExtension } = runHashchangeOwnershipHandoff();

  assert.equal(afterBaseRouter, 'sentinel-before-validation', 'base router must yield without writing #main');
  assert.match(afterExtension, /01 · Baseline/, 'validation extension must own and render the route');
});
