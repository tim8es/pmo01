const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

const html = read('index.html');
const simulatorHtml = read('simulator.html');
const experience = read('learning-experience-v2.js');
const clarity = read('course-clarity-v3.js');
const simulatorApp = read('m01-simulator-app.js');
const simulatorData = read('m01-simulator-data.js');

test('global navigation contains course utilities but not the M01 final case', () => {
  const mainNav = html.match(/<nav class="main-nav">([\s\S]*?)<\/nav>/)?.[1] || '';
  const mobileNav = html.match(/<nav class="mobile-nav"[\s\S]*?>([\s\S]*?)<\/nav>/)?.[1] || '';
  for (const nav of [mainNav, mobileNav]) {
    assert.match(nav, /Главная/);
    assert.match(nav, /Учебный путь/);
    assert.match(nav, /Самопроверка/);
    assert.match(nav, /Инструменты/);
    assert.doesNotMatch(nav, /simulator\.html#\/mission\/m01/);
    assert.doesNotMatch(nav, /Симуляц|Мисси|Итоговый кейс/);
  }
});

test('returning learner home has one dominant learning continuation instead of a dashboard of product concepts', () => {
  assert.match(experience, /lx-course-home/);
  assert.match(experience, /lx-course-roadmap/);
  assert.match(experience, /Что дальше/);
  assert.match(experience, /Продолжить обучение/);
  assert.doesNotMatch(experience, /class="lx-dashboard-grid"/);
  assert.doesNotMatch(experience, /class="lx-mission-card"/);
  assert.doesNotMatch(experience, /Mastery · M01/);
  assert.doesNotMatch(experience, /Project Map<\/p><h2/);
  assert.doesNotMatch(experience, /Decision Journal<\/p><h2/);
});

test('M01 learning path frames the final case as step three of the module', () => {
  assert.match(experience, /Итоговый кейс M01/);
  assert.match(experience, /2\/2 уроков/);
  assert.match(experience, /Применить оба навыка/);
  assert.doesNotMatch(experience, /Финал блока: интерактивная миссия/);
  assert.match(clarity, /Итоговый кейс M01/);
  assert.doesNotMatch(clarity, /Практическая симуляция · M01/);
});

test('final case is completed only after final review is reached', () => {
  const body = experience.match(/function simulationComplete\(\) \{([\s\S]*?)\n  \}/)?.[1] || '';
  assert.match(body, /reviewReachedAt/);
  assert.match(body, /completedAt/);
  assert.doesNotMatch(body, /decisions\.length/);
  assert.match(experience, /m01-mission-partner-launch-v1/);
});

test('changing company context can rebuild the fresh-home selector', () => {
  const body = experience.match(/function refreshDynamicCompanyContent\(\) \{([\s\S]*?)\n  \}/)?.[1] || '';
  assert.match(body, /lx-learning-promise/);
  assert.match(body, /remove\(\)/);
});

test('all four simulator decisions define an instructional debrief without changing treatment identity', () => {
  const context = { window: {} };
  vm.runInNewContext(simulatorData, context);
  const mission = context.window.PM01SimulatorData.mission;
  assert.equal(mission.id, 'm01-mission-partner-launch-v1');
  assert.equal(mission.version, 1);
  assert.equal(mission.decisions.length, 4);
  for (const decision of mission.decisions) {
    assert.ok(decision.debrief, `${decision.id} missing debrief`);
    assert.ok(decision.options.some((option) => option.id === decision.debrief.referenceOptionId), `${decision.id} reference option missing`);
    assert.ok(decision.debrief.why.length >= 70, `${decision.id} debrief why is too thin`);
    assert.ok(decision.debrief.principle.length >= 25, `${decision.id} principle is too thin`);
    assert.ok(['project-system', 'system-diagnostic'].includes(decision.debrief.lessonId), `${decision.id} lesson link invalid`);
    assert.match(decision.debrief.lessonLabel, /^M01\.[12]/);
  }
});

test('final case briefing and review explain learning value instead of validation mechanics', () => {
  assert.match(simulatorHtml, /Итоговый кейс M01/);
  assert.match(simulatorApp, /M01 · Итоговый кейс/);
  assert.match(simulatorApp, /Что проверяет кейс/);
  assert.match(simulatorApp, /Эталонный ход/);
  assert.match(simulatorApp, /Почему это сильнее/);
  assert.match(simulatorApp, /PM-принцип/);
  assert.match(simulatorApp, /Что уже получается/);
  assert.match(simulatorApp, /Что усилить/);
  assert.match(simulatorApp, /Вернуться к M01/);
  assert.doesNotMatch(simulatorApp, /Здесь нет оценки или эталонного пути до post-case/);
  assert.doesNotMatch(simulatorApp, /Перед post-case/);
});

test('v4 keeps simulator compatibility identifiers and local-only execution', () => {
  assert.match(simulatorApp, /pm01-sim-m01-v1/);
  assert.match(simulatorApp, /mission\/m01/);
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(/.test(experience + simulatorApp + clarity), false);
});
