const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const courseDataCode = fs.readFileSync(path.join(__dirname, '..', 'course-data.js'), 'utf8');
const validationDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-data.js'), 'utf8');
const labDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-learning-lab-data.js'), 'utf8');
const appCode = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

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
    addEventListener(type, callback) {
      if (type === 'change') this.change = callback;
    },
  };
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
    addEventListener() {},
    scrollTo() {},
  };
  const context = {
    window,
    document,
    localStorage,
    location: { hash: '#/lesson/project-system' },
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

  first.change({ target: first });
  second.change({ target: second });

  const stored = JSON.parse(localStorage.getItem('pm01-state-v1'));
  assert.equal(stored.lab['project-system'].drillAnswers['m01-drill-system'], 'escalate-dev');
  assert.equal(first.disabled, true);
  assert.equal(second.disabled, true);
});
