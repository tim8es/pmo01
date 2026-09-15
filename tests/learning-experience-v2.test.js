const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

const html = read('index.html');
const simulatorHtml = read('simulator.html');
const experience = read('learning-experience-v2.js');
const styles = read('learning-experience-v2.css');
const simulatorData = read('m01-simulator-data.js');

test('learning experience v2 assets load after the existing UX and course runtime', () => {
  assert.ok(html.includes('learning-experience-v2.css'));
  assert.ok(html.includes('learning-experience-v2.js'));
  assert.ok(simulatorHtml.includes('learning-experience-v2.css'));
  assert.ok(simulatorHtml.includes('learning-experience-v2.js'));
  assert.ok(html.indexOf('learning-experience-v2.css') > html.indexOf('ux-enhancements.css'));
  assert.ok(html.indexOf('learning-experience-v2.js') > html.indexOf('app.js'));
  assert.ok(simulatorHtml.indexOf('learning-experience-v2.js') > simulatorHtml.indexOf('m01-simulator-app.js'));
});

test('experience layer is syntactically valid and remains local-only', () => {
  assert.doesNotThrow(() => new Function(experience));
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(/.test(experience), false, 'learning UX must not add network or telemetry calls');
});

test('company context supports small, medium and large business without mutating M01 treatment', () => {
  assert.ok(experience.includes("small:"));
  assert.ok(experience.includes("medium:"));
  assert.ok(experience.includes("large:"));
  assert.ok(experience.includes('Малый бизнес'));
  assert.ok(experience.includes('Средний бизнес'));
  assert.ok(experience.includes('Крупный бизнес'));
  assert.ok(experience.includes('pm01-company-context-v1'));
  assert.ok(experience.includes('не влияет на базовые метрики итогового кейса'));
  assert.ok(simulatorData.includes("id: 'm01-mission-partner-launch-v1'"));
  assert.ok(simulatorData.includes('version: 1'));
});

test('course explains a decision-first loop and gives a fallback practice context', () => {
  for (const label of ['Решение', 'Последствие', 'Разбор', 'Перенос']) assert.ok(experience.includes(label));
  assert.ok(experience.includes('Нет своего проекта? Используй учебный.'));
  assert.ok(experience.includes('Можно работать на своём проекте — или на готовом учебном.'));
  assert.ok(experience.includes('Заметка к решению · необязательно'));
  assert.ok(experience.includes('Итоговый кейс M01'));
});

test('returning home prioritizes one next learning action over mastery dashboards', () => {
  assert.ok(experience.includes('lx-course-home'));
  assert.ok(experience.includes('lx-course-roadmap'));
  assert.ok(experience.includes('Что дальше'));
  assert.ok(experience.includes('Продолжить обучение'));
  assert.equal(experience.includes('Mastery · M01'), false);
  assert.equal(experience.includes('Навыки, а не XP'), false);
  assert.equal(experience.includes('class="lx-dashboard-grid"'), false);
  assert.equal(experience.includes('class="lx-mission-card"'), false);
});

test('light theme has a semantic repair layer for legacy hard-coded surfaces', () => {
  assert.ok(styles.includes('Semantic repair'));
  assert.ok(styles.includes('html[data-theme="light"] .model-card'));
  assert.ok(styles.includes('html[data-theme="light"] .practice'));
  assert.ok(styles.includes('html[data-theme="light"] .question-card'));
  assert.ok(styles.includes('html[data-theme="light"] textarea'));
});

test('M01 final case keeps existing runtime but is framed as part of the module', () => {
  const clarity = read('course-clarity-v3.js');
  assert.equal(html.includes('Симуляция M01'), false);
  assert.equal((html.match(/simulator\.html#\/mission\/m01/g) || []).length, 0);
  assert.ok(simulatorHtml.includes('Итоговый кейс M01'));
  assert.ok(simulatorHtml.includes('К M01'));
  assert.ok(clarity.includes('Итоговый кейс M01'));
});