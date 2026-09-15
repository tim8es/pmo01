const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(name){ return fs.readFileSync(path.join(__dirname,'..',name),'utf8'); }
const index=read('index.html'); const simulator=read('simulator.html'); const theme=read('theme-runtime-v7.js'); const css=read('canonical-runtime-v7.css'); const app=read('app.js');

test('course and simulator share isolated v7 theme runtime, not UX overlay', () => {
  for (const html of [index,simulator]) { assert.ok(html.includes('theme-runtime-v7.js')); assert.ok(html.includes('canonical-runtime-v7.css')); assert.equal(html.includes('ux-enhancements.js'),false); assert.equal(html.includes('ux-enhancements.css'),false); }
});

test('theme supports system preference, persistence and root data-theme', () => {
  assert.ok(theme.includes('pm01-theme-v1')); assert.ok(theme.includes('prefers-color-scheme: light')); assert.ok(theme.includes('root.dataset.theme')); assert.ok(css.includes('.theme-toggle'));
  assert.doesNotMatch(theme,/courseState|lastLesson|homeView|courseView|MutationObserver/);
});

test('learning path and returning home are owned directly by app state', () => {
  assert.ok(app.includes('completedStepCount')); assert.ok(app.includes('module.lessons')); assert.ok(app.includes('v7-module-steps')); assert.ok(app.includes('nextStep()')); assert.ok(app.includes('Продолжить обучение'));
});

test('canonical UI remains local-only', () => {
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|WebSocket\s*\(/.test(theme+app),false);
});
