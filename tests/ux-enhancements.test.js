const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

const indexHtml = read('index.html');
const simulatorHtml = read('simulator.html');
const uxJs = read('ux-enhancements.js');
const uxCss = read('ux-enhancements.css');

test('main course and standalone simulator load the shared UX theme layer', () => {
  for (const html of [indexHtml, simulatorHtml]) {
    assert.equal(html.includes('href="ux-enhancements.css"'), true, 'shared UX stylesheet missing');
    assert.equal(html.includes('src="ux-enhancements.js"'), true, 'shared UX script missing');
  }
});

test('theme contract supports light/dark preference and persistence', () => {
  assert.equal(uxJs.includes('pm01-theme-v1'), true, 'theme storage key missing');
  assert.equal(uxJs.includes('prefers-color-scheme: light'), true, 'system theme fallback missing');
  assert.equal(uxJs.includes('root.dataset.theme'), true, 'theme must be applied on document root');
  assert.equal(uxCss.includes(':root[data-theme="light"]'), true, 'light theme token set missing');
  assert.equal(uxCss.includes('.theme-toggle'), true, 'visible theme control styling missing');
});

test('learning path exposes lesson count and per-module progress from module lessons', () => {
  assert.equal(uxJs.includes('module.lessons.length'), true, 'module lesson count must come from course data');
  assert.equal(uxJs.includes('module-learning-meta'), true, 'module learning metadata hook missing');
  assert.equal(uxJs.includes('module-learning-progress'), true, 'module progress indicator missing');
  assert.equal(uxCss.includes('.module-learning-meta'), true, 'module metadata styles missing');
});

test('returning learner home is driven by existing course state and exposes a continuation CTA', () => {
  assert.equal(uxJs.includes('pm01-state-v1'), true, 'must reuse existing course state');
  assert.equal(uxJs.includes('lastLesson'), true, 'last lesson state missing');
  assert.equal(uxJs.includes('completed'), true, 'completion state missing');
  assert.equal(uxJs.includes('returning-home'), true, 'returning learner dashboard missing');
  assert.equal(uxJs.includes('Продолжить урок'), true, 'primary continuation CTA missing');
  assert.equal(uxCss.includes('.home-returning > .hero'), true, 'marketing hero must yield to returning dashboard');
});

test('UX layer remains local-only and does not add telemetry or network calls', () => {
  assert.equal(uxJs.includes('fetch('), false, 'UX layer must not add network fetches');
  assert.equal(uxJs.includes('XMLHttpRequest'), false, 'UX layer must not add network requests');
  assert.equal(uxJs.includes('navigator.sendBeacon'), false, 'UX layer must not add telemetry');
});
