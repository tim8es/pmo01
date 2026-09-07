const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const courseDataCode = fs.readFileSync(path.join(__dirname, '..', 'course-data.js'), 'utf8');
const validationDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-data.js'), 'utf8');
const labDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-learning-lab-data.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
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

function drillInput(value) {
  return {
    value,
    disabled: false,
    dataset: { labDrill: 'm01-drill-system' },
    listeners: [],
    addEventListener(type, callback) {
      if (type === 'change') this.listeners.push(callback);
    },
  };
}

function dispatchChange(input) {
  if (input.disabled) return;
  for (const callback of input.listeners) callback({ target: input, currentTarget: input });
}

test('M01 cold drill freezes the first choice after feedback instead of allowing answer replacement', () => {
  const first = drillInput('escalate-dev');
  const second = drillInput('track-dependency');
  const main = { innerHTML: '', focus() {} };
  const sidebarProgress = { innerHTML: '' };
  const mobileNav = { classList: { remove() {}, toggle() { return false; } } };
  const menuButton = { addEventListener() {}, setAttribute() {} };

  const document = {
    querySelector(selector) {
      if (selector === '#main') return main;
      if (selector === '#sidebar-progress') return sidebarProgress;
      if (selector === '#mobile-nav') return mobileNav;
      if (selector === '#menu-button') return menuButton;
      return null;
    },
    querySelectorAll(selector) {
      if (selector === '[data-lab-drill]') return [first, second];
      if (selector === '[data-lab-drill="m01-drill-system"]') return [first, second];
      return [];
    },
  };
  const localStorage = storageFrom();
  const window = {
    PM01Learning: domain,
    addEventListener() {},
    scrollTo() {},
    confirm() { return true; },
  };
  const context = {
    window,
    document,
    localStorage,
    location: { hash: '#/lesson/project-system' },
    queueMicrotask(callback) { callback(); },
    console,
    Blob,
    URL,
    Date,
  };

  vm.createContext(context);
  vm.runInContext(courseDataCode, context, { filename: 'course-data.js' });
  vm.runInContext(validationDataCode, context, { filename: 'm01-validation-data.js' });
  vm.runInContext(labDataCode, context, { filename: 'm01-learning-lab-data.js' });
  vm.runInContext(appCode, context, { filename: 'app.js' });
  vm.runInContext(validationAppCode, context, { filename: 'm01-validation-app.js' });

  dispatchChange(first);
  assert.equal(first.disabled, true);
  assert.equal(second.disabled, true);

  dispatchChange(second);

  const stored = JSON.parse(localStorage.getItem('pm01-state-v1'));
  assert.equal(stored.lab['project-system'].drillAnswers['m01-drill-system'], 'escalate-dev');
});
