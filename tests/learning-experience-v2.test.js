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
  assert.ok(experience.includes('не влияет на базовые метрики миссии'));
  assert.ok(simulatorData.includes("id: 'm01-mission-partner-launch-v1'"));
  assert.ok(simulatorData.includes('version: 1'));
});

test('course now explains a decision-first learning loop and provides fallback practice context', () => {
  for (const label of ['Решение', 'Последствие', 'Разбор', 'Перенос']) assert.ok(experience.includes(label));
  assert.ok(experience.includes('Нет своего проекта? Используй учебный.'));
  assert.ok(experience.includes('Можно работать на своём проекте — или на готовом учебном.'));
  assert.ok(experience.includes('Decision Journal'));
  assert.ok(experience.includes('Project Map'));
});

test('mastery gamification is evidence-based rather than XP-based', () => {
  assert.ok(experience.includes('Mastery · M01'));
  assert.ok(experience.includes('Навыки, а не XP'));
  assert.ok(experience.includes('Проверено в миссии'));
  assert.ok(experience.includes('run?.decisions'));
});

test('light theme has a final semantic repair layer for legacy hard-coded surfaces', () => {
  assert.ok(styles.includes('Semantic repair'));
  assert.ok(styles.includes('html[data-theme="light"] .model-card'));
  assert.ok(styles.includes('html[data-theme="light"] .practice'));
  assert.ok(styles.includes('html[data-theme="light"] .question-card'));
  assert.ok(styles.includes('html[data-theme="light"] textarea'));
});

test('M01 simulator is framed as a course mission instead of a detached validation tool', () => {
  assert.ok(html.includes('Миссия M01'));
  assert.ok(simulatorHtml.includes('M01 MISSION'));
  assert.ok(simulatorHtml.includes('К учебному пути'));
});
