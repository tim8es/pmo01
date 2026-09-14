const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

const indexHtml = read('index.html');
const simulatorHtml = read('simulator.html');
const themeJs = read('theme-runtime-v6.js');
const experienceJs = read('course-experience-v6.js');
const experienceCss = read('course-experience-v6.css');

test('main course and standalone simulator load the shared v6 theme runtime and experience styles', () => {
  for (const html of [indexHtml, simulatorHtml]) {
    assert.equal(html.includes('href="course-experience-v6.css"'), true, 'shared v6 experience stylesheet missing');
    assert.equal(html.includes('src="theme-runtime-v6.js"'), true, 'shared theme runtime missing');
    assert.equal(html.includes('src="ux-enhancements.js"'), false, 'legacy UX injector must stay retired');
  }
});

test('theme contract supports light/dark preference and persistence without course UI injection', () => {
  assert.equal(themeJs.includes('pm01-theme-v1'), true, 'theme storage key missing');
  assert.equal(themeJs.includes('prefers-color-scheme: light'), true, 'system theme fallback missing');
  assert.equal(themeJs.includes('root.dataset.theme'), true, 'theme must be applied on document root');
  assert.equal(themeJs.includes('theme-toggle'), true, 'visible theme control missing');
  assert.equal(themeJs.includes('returning-home'), false, 'theme runtime must not own course home');
  assert.equal(themeJs.includes('module-learning-meta'), false, 'theme runtime must not own learning path');
});

test('learning path exposes module steps and evidence-based competency progress', () => {
  assert.equal(experienceJs.includes('v6-module-steps'), true, 'module step UI missing');
  assert.equal(experienceJs.includes('module-practice-step'), true, 'module final-practice step missing');
  assert.equal(experienceJs.includes('deriveMastery'), true, 'competency derivation missing');
  assert.equal(experienceCss.includes('.v6-module-steps'), true, 'module step styles missing');
});

test('returning learner home is driven by course state and exposes a single continuation CTA', () => {
  assert.equal(experienceJs.includes('pm01-state-v1'), true, 'must reuse existing course state');
  assert.equal(experienceJs.includes('lastLesson'), true, 'last lesson state missing');
  assert.equal(experienceJs.includes('completed'), true, 'completion state missing');
  assert.equal(experienceJs.includes('course-home-v6'), true, 'returning learner home missing');
  assert.equal(experienceJs.includes('Продолжить обучение'), true, 'primary continuation CTA missing');
});

test('v6 theme and experience layers remain local-only and do not add telemetry or network calls', () => {
  const combined = themeJs + experienceJs;
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|WebSocket\s*\(/.test(combined), false);
});
