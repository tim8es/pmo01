const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('index loads simulator CSS and data-domain-app before validation extension', () => {
  const html = read('index.html');
  const css = html.indexOf('m01-simulator.css');
  const data = html.indexOf('m01-simulator-data.js');
  const domain = html.indexOf('m01-simulator-domain.js');
  const app = html.indexOf('m01-simulator-app.js');
  const validation = html.indexOf('m01-validation-app.js');
  assert.ok(css >= 0);
  assert.ok(data >= 0 && domain > data && app > domain && validation > app);
});

test('base router reserves mission/m01 and M01 course entry targets simulator without changing other modules', () => {
  const app = read('app.js');
  assert.match(app, /mission\/m01/);
  assert.match(app, /module\.id\s*===\s*["']m01["']/);
  assert.match(app, /#\/mission\/m01/);
});

test('simulator app owns mission route, isolated storage, semantic choices and focusable progression', () => {
  const simulator = read('m01-simulator-app.js');
  assert.match(simulator, /pm01-simulator-m01-v1/);
  assert.match(simulator, /mission\/m01/);
  assert.match(simulator, /<fieldset/);
  assert.match(simulator, /aria-expanded/);
  assert.match(simulator, /aria-live/);
  assert.match(simulator, /focus\(\)/);
  assert.doesNotMatch(simulator, /telemetry/i);
});

test('validation uses pinned simulator completion instead of legacy lesson completion for treatment gate', () => {
  const validation = read('m01-validation-app.js');
  assert.match(validation, /pm01-simulator-m01-v1/);
  assert.match(validation, /m01-mission-partner-launch-v1/);
  assert.match(validation, /#\/mission\/m01/);
  assert.match(validation, /симулятор|мисси/i);
});

test('simulator styles include reduced-motion handling and visible meter semantics', () => {
  const css = read('m01-simulator.css');
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /sim-meter/);
  assert.match(css, /:focus-visible/);
});

test('pre-post trajectory review does not reveal preferred-answer labels', () => {
  const simulator = read('m01-simulator-app.js');
  assert.doesNotMatch(simulator, /правильн(ый|ая|ое)|preferred answer|сильный ход/i);
});
