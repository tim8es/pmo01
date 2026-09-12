const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('index loads simulator runtime, routing and validation gate before validation extension', () => {
  const html = read('index.html');
  const css = html.indexOf('m01-simulator.css');
  const data = html.indexOf('m01-simulator-data.js');
  const domain = html.indexOf('m01-simulator-domain.js');
  const app = html.indexOf('m01-simulator-app.js');
  const routing = html.indexOf('m01-simulator-routing.js');
  const gate = html.indexOf('m01-validation-simulator-gate.js');
  const validation = html.indexOf('m01-validation-app.js');
  assert.ok(css >= 0);
  assert.ok(data >= 0 && domain > data && app > domain && routing > app && gate > routing && validation > gate);
});

test('M01 routing adapter sends course and validation entries to mission/m01', () => {
  const routing = read('m01-simulator-routing.js');
  assert.match(routing, /#\/mission\/m01/);
  assert.match(routing, /project-system/);
  assert.match(routing, /system-diagnostic/);
  assert.match(routing, /m01MissionEntry/);
});

test('simulator is explicitly discoverable from desktop and mobile navigation', () => {
  const html = read('index.html');
  const missionLinks = html.match(/href="#\/mission\/m01"/g) || [];
  assert.ok(missionLinks.length >= 2, 'expected visible mission links in desktop and mobile navigation');
  assert.match(html, /Симулятор M01/);
});

test('routing adapter relabels legacy M01 lesson entries as simulator actions', () => {
  const routing = read('m01-simulator-routing.js');
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

test('pre-post trajectory review does not reveal preferred-answer labels', () => {
  const simulator = read('m01-simulator-app.js');
  assert.doesNotMatch(simulator, /правильн(ый|ая|ое)|preferred answer|сильный ход/i);
});
