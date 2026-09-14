const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

const html = read('index.html');
const simulatorHtml = read('simulator.html');
const experience = read('course-experience-v6.js');
const styles = read('course-experience-v6.css');
const simulatorData = read('m01-simulator-data.js');

test('unified experience assets load after course runtime in both course and simulator', () => {
  assert.ok(html.includes('course-experience-v6.css'));
  assert.ok(html.includes('course-experience-v6.js'));
  assert.ok(simulatorHtml.includes('course-experience-v6.css'));
  assert.ok(simulatorHtml.includes('course-experience-v6.js'));
  assert.ok(html.indexOf('course-experience-v6.css') > html.indexOf('theme-contract-v3.css'));
  assert.ok(html.indexOf('course-experience-v6.js') > html.indexOf('app.js'));
  assert.ok(simulatorHtml.indexOf('course-experience-v6.js') > simulatorHtml.indexOf('m01-simulator-app.js'));
  assert.equal(html.includes('learning-experience-v2.js'), false);
  assert.equal(simulatorHtml.includes('learning-experience-v2.js'), false);
});

test('experience layer is syntactically valid and remains local-only', () => {
  assert.doesNotThrow(() => new Function(experience));
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|WebSocket\s*\(/.test(experience), false, 'learning UX must not add network or telemetry calls');
});

test('company context supports small medium and large business without mutating M01 treatment', () => {
  assert.ok(experience.includes('small:'));
  assert.ok(experience.includes('medium:'));
  assert.ok(experience.includes('large:'));
  assert.ok(experience.includes('Малый бизнес'));
  assert.ok(experience.includes('Средний бизнес'));
  assert.ok(experience.includes('Крупный бизнес'));
  assert.ok(experience.includes('pm01-company-context-v1'));
  assert.ok(experience.includes('не скрытую сложность кейса'));
  assert.ok(simulatorData.includes("id: 'm01-mission-partner-launch-v1'"));
  assert.ok(simulatorData.includes('version: 1'));
});

test('course explains one decision-first learning loop with proof at module practice', () => {
  for (const label of ['Решение', 'разбор', 'инструмент', 'перенос', 'Итоговая практика']) assert.ok(experience.includes(label));
  assert.ok(experience.includes('Реши до объяснения'));
  assert.ok(experience.includes('Заполни рабочий артефакт'));
  assert.ok(experience.includes('Докажи в новом кейсе'));
  assert.ok(experience.includes('Итоговый кейс M01'));
});

test('returning home prioritizes one next learning action and one current competency', () => {
  assert.ok(experience.includes('course-home-v6'));
  assert.ok(experience.includes('Продолжить обучение'));
  assert.ok(experience.includes('Навык сейчас'));
  assert.ok(experience.includes('Следующее доказательство'));
  assert.ok(experience.includes('Карта компетенций'));
  assert.equal(experience.includes('Mastery · M01'), false);
  assert.equal(experience.includes('class="lx-dashboard-grid"'), false);
});

test('v6 styles cover responsive learning and module-practice surfaces', () => {
  assert.ok(styles.includes('.course-home-v6'));
  assert.ok(styles.includes('.course-path-v6'));
  assert.ok(styles.includes('.v6-skill-map'));
  assert.ok(styles.includes('.mp-decision'));
  assert.ok(styles.includes('@media (max-width:'));
  assert.ok(styles.includes('prefers-reduced-motion'));
});

test('M01 final case keeps existing runtime but is framed as the third module step', () => {
  assert.equal(html.includes('Симуляция M01'), false);
  assert.equal((html.match(/simulator\.html#\/mission\/m01/g) || []).length, 0);
  assert.ok(simulatorHtml.includes('Итоговый кейс M01'));
  assert.ok(simulatorHtml.includes('К M01'));
  assert.ok(experience.includes("module.id === 'm01'"));
  assert.ok(experience.includes('module-practice-step'));
});
