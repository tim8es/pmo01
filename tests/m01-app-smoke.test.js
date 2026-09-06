const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const domain = require('../learning-domain.js');
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

test('fresh validation route renders baseline without exposing learning drills or post-case controls', () => {
  const { main } = runValidationApp('validation/m01');

  assert.match(main.innerHTML, /01 · Baseline/);
  assert.match(main.innerHTML, /data-submit-assessment="baseline"/);
  assert.doesNotMatch(main.innerHTML, /Decision Drill/);
  assert.doesNotMatch(main.innerHTML, /data-submit-assessment="postCase"/);
});

test('post-case unlocks only after baseline, both lessons, and both drills are recorded', () => {
  const validationState = {
    version: 1,
    baseline: {
      answers: {},
      reasoning: 'Исходный диагноз уже был зафиксирован ранее.',
      submittedAt: '2026-09-06T12:00:00.000Z',
      score: { total: 5, max: 15, byDimension: {}, answered: 5 },
    },
    drills: {
      'm01-drill-system': { choice: 'track-dependency', selectedAt: '2026-09-06T12:10:00.000Z' },
      'm01-drill-diagnostic': { choice: 'decision-interface', selectedAt: '2026-09-06T12:11:00.000Z' },
    },
  };
  const legacyState = { completed: ['project-system', 'system-diagnostic'] };
  const { main } = runValidationApp('validation/m01', {
    'pm01-validation-m01-v1': JSON.stringify(validationState),
    'pm01-state-v1': JSON.stringify(legacyState),
  });

  assert.match(main.innerHTML, /Decision Drill/);
  assert.match(main.innerHTML, /data-submit-assessment="postCase"/);
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
