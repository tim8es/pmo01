const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const courseDataCode = fs.readFileSync(path.join(__dirname, '..', 'course-data.js'), 'utf8');
const validationDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-data.js'), 'utf8');
const labDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-learning-lab-data.js'), 'utf8');
const validationAppCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-app.js'), 'utf8');
const domain = require('../learning-domain.js');

function storageFrom(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test('validation post-case stays locked when legacy completed flags lack current Learning Lab evidence', () => {
  const main = { innerHTML: '', focus() {} };
  const document = {
    querySelector(selector) { return selector === '#main' ? main : null; },
    querySelectorAll() { return []; },
  };
  const validationState = {
    version: 1,
    baseline: {
      answers: {}, reasoning: 'Исходный диагноз уже зафиксирован до обучения.',
      submittedAt: '2026-09-07T10:00:00.000Z',
      score: { total: 5, max: 15, byDimension: {}, answered: 5 },
    },
    drills: {
      'm01-drill-system': { choice: 'track-dependency', selectedAt: '2026-09-07T10:10:00.000Z' },
      'm01-drill-diagnostic': { choice: 'decision-interface', selectedAt: '2026-09-07T10:11:00.000Z' },
    },
  };
  const courseState = {
    completed: ['project-system', 'system-diagnostic'],
    notes: {}, criteria: {}, lastLesson: null, diagnostic: {}, lab: {},
  };
  const localStorage = storageFrom({
    'pm01-validation-m01-v1': JSON.stringify(validationState),
    'pm01-state-v1': JSON.stringify(courseState),
  });
  const window = {
    PM01Learning: domain,
    addEventListener() {},
    confirm() { return true; },
  };
  const context = {
    window, document, localStorage,
    location: { hash: '#/validation/m01' },
    queueMicrotask(callback) { callback(); },
    console, Date,
  };
  vm.createContext(context);
  vm.runInContext(courseDataCode, context, { filename: 'course-data.js' });
  vm.runInContext(validationDataCode, context, { filename: 'm01-validation-data.js' });
  vm.runInContext(labDataCode, context, { filename: 'm01-learning-lab-data.js' });
  vm.runInContext(validationAppCode, context, { filename: 'm01-validation-app.js' });

  assert.match(main.innerHTML, /Уроки: нужно завершить оба/);
  assert.doesNotMatch(main.innerHTML, /data-submit-assessment="postCase"/);
});
