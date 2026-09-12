const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('index loads simulator routing and validation integration', () => {
  const html = read('index.html');
  const routing = html.indexOf('m01-simulator-routing.js');
  const gate = html.indexOf('m01-validation-simulator-gate.js');
  const validation = html.indexOf('m01-validation-app.js');
  assert.ok(routing >= 0 && gate > routing && validation > gate);
});

test('dedicated simulator entrypoint bypasses legacy app router and loads simulator runtime', () => {
  const html = read('simulator.html');
  assert.doesNotMatch(html, /src="app\.js"/);
  assert.match(html, /<base href="\.\/index\.html"/);
  const data = html.indexOf('m01-simulator-data.js');
  const domain = html.indexOf('m01-simulator-domain.js');
  const app = html.indexOf('m01-simulator-app.js');
  assert.ok(data >= 0 && domain > data && app > domain);
});

test('desktop and mobile navigation point to dedicated simulator entrypoint', () => {
  const html = read('index.html');
  const missionLinks = html.match(/href="simulator\.html#\/mission\/m01"/g) || [];
  assert.ok(missionLinks.length >= 2, 'expected dedicated mission links in desktop and mobile navigation');
  assert.match(html, /Симулятор M01/);
});

test('M01 routing adapter sends course and validation entries to dedicated simulator entrypoint', () => {
  const routing = read('m01-simulator-routing.js');
  assert.match(routing, /simulator\.html#\/mission\/m01/);
  assert.match(routing, /project-system/);
  assert.match(routing, /system-diagnostic/);
  assert.match(routing, /Открыть симулятор/);
  assert.match(routing, /7–10 минут/);
});

test('simulator app owns mission route, isolated storage, semantic choices and focusable progression', () => {
  const simulator = read('m01-simulator-app.js');
  assert.match(simulator, /pm01-sim-m01-v1/);
  assert.match(simulator, /mission\/m01/);
  assert.match(simulator, /<fieldset/);
  assert.match(simulator, /aria-expanded/);
  assert.match(simulator, /aria-live/);
  assert.match(simulator, /focus\(\)/);
  assert.doesNotMatch(simulator, /telemetry/i);
});

test('validation gate is pinned to exact simulator treatment and neutralizes legacy M01 flags', () => {
  const gate = read('m01-validation-simulator-gate.js');
  assert.match(gate, /pm01-sim-m01-v1/);
  assert.match(gate, /m01-mission-partner-launch-v1/);
  assert.match(gate, /missionVersion\s*=\s*1/);
  assert.match(gate, /reviewReachedAt/);
  assert.match(gate, /completedAt/);
  assert.match(gate, /project-system/);
  assert.match(gate, /system-diagnostic/);
  assert.match(gate, /filter\(\(id\) => !m01LessonIds\.includes\(id\)\)/);
});

test('simulator styles include reduced-motion handling and visible meter semantics', () => {
  const css = read('m01-simulator.css');
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /sim-meter/);
  assert.match(css, /:focus-visible/);
});

test('light simulator panels use a private dark text token immune to later art-direction variables', () => {
  const css = read('m01-simulator.css');
  assert.match(css, /--sim-text:\s*#[0-9a-fA-F]{6}/);
  assert.match(css, /\.sim-meter[\s\S]*?color:\s*var\(--sim-text\)/);
  assert.match(css, /\.sim-situation[\s\S]*?color:\s*var\(--sim-text\)/);
  assert.match(css, /\.sim-shell \.sim-tools h3[\s\S]*?color:\s*var\(--sim-text\)/);
  assert.match(css, /\.sim-rationale textarea[\s\S]*?color:\s*var\(--sim-text\)/);
});

test('required rationale exposes the same 8-character rule before submit', () => {
  const simulator = read('m01-simulator-app.js');
  assert.match(simulator, /minlength="8"/);
  assert.match(simulator, /required/);
  assert.match(simulator, /Минимум 8/);
});

test('pre-post trajectory review does not reveal preferred-answer labels', () => {
  const simulator = read('m01-simulator-app.js');
  assert.doesNotMatch(simulator, /правильн(ый|ая|ое)|preferred answer|сильный ход/i);
});

test('light simulator panels force readable descendant text in the rendered cascade', () => {
  const css = read('m01-simulator.css');
  assert.match(css, /\.sim-shell \.sim-meter \*/, 'meter descendants must have an explicit readable color');
  assert.match(css, /color:\s*#[0-9a-fA-F]{6}\s*!important/);
});
