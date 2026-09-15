const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(name) { return fs.readFileSync(path.join(__dirname, '..', name), 'utf8'); }
const html=read('index.html'); const simulatorHtml=read('simulator.html'); const app=read('app.js'); const styles=read('canonical-runtime-v7.css'); const simulatorData=read('m01-simulator-data.js');

test('canonical runtime replaces learning-experience overlay in course and simulator', () => {
  assert.ok(html.includes('canonical-runtime-v7.css')); assert.ok(html.includes('theme-runtime-v7.js'));
  assert.equal(html.includes('learning-experience-v2.js'),false); assert.equal(html.includes('learning-experience-v2.css'),false);
  assert.ok(simulatorHtml.includes('canonical-runtime-v7.css')); assert.ok(simulatorHtml.includes('theme-runtime-v7.js'));
  assert.equal(simulatorHtml.includes('learning-experience-v2.js'),false);
});

test('canonical app remains local-only', () => {
  assert.doesNotThrow(()=>new Function(app));
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|WebSocket\s*\(/.test(app),false);
});

test('M01 treatment identity remains unchanged', () => {
  assert.ok(simulatorData.includes("id: 'm01-mission-partner-launch-v1'")); assert.ok(simulatorData.includes('version: 1'));
});

test('course explains one decision-first loop with module proof', () => {
  for (const label of ['Реши','Увидь последствия','Разбери механизм','Примени','Докажи','Итоговая практика']) assert.ok(app.includes(label));
});

test('returning home prioritizes one continuation and current competency', () => {
  assert.ok(app.includes('v7-home')); assert.ok(app.includes('Продолжить обучение')); assert.ok(app.includes('Навык сейчас')); assert.ok(app.includes('Следующее доказательство')); assert.ok(app.includes('Карта компетенций'));
  assert.equal(app.includes('lx-dashboard-grid'),false);
});

test('canonical styles cover responsive course, lesson, practice and reduced motion', () => {
  for (const token of ['.v7-home','.v7-course','.v7-practice','.v7-skill-map','@media (max-width:','prefers-reduced-motion']) assert.ok(styles.includes(token),token);
});

test('M01 final case is a third module step, not top navigation', () => {
  const nav=html.match(/<nav class="main-nav">([\s\S]*?)<\/nav>/)?.[1]||'';
  assert.doesNotMatch(nav,/simulator\.html|Итоговая практика M01/);
  assert.ok(app.includes('simulator.html#/mission/m01')); assert.ok(simulatorHtml.includes('Итоговый кейс M01')); assert.ok(simulatorHtml.includes('К M01'));
});
