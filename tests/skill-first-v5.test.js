const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
}

const index = read('index.html');
const app = read('app.js');
const m02LabSource = read('m02-learning-lab-data-v5.js');
const masteryV6 = read('mastery-domain-v6.js');
const practiceV6 = read('module-practice-v6.js');
const experienceV6 = read('course-experience-v6.js');

function loadCourse(extraSources = []) {
  const context = { window: {} };
  vm.runInNewContext(read('course-data.js'), context);
  for (const source of extraSources) vm.runInNewContext(source, context);
  return context.window.PM01;
}

test('M02 v5 learning-lab content remains a data input while v5 presentation runtime is retired', () => {
  assert.match(index, /m02-learning-lab-data-v5\.js/);
  assert.ok(index.indexOf('m02-learning-lab-data-v5.js') < index.indexOf('course-learning-labs-v6.js'));
  assert.ok(index.indexOf('course-learning-labs-v6.js') < index.indexOf('app.js'));
  for (const retired of ['mastery-domain-v5.js', 'm02-challenge-v5.js', 'skill-first-ui-v5.js', 'skill-first-ui-v5.css', 'm02-challenge-v5.css']) {
    assert.doesNotMatch(index, new RegExp(retired.replaceAll('.', '\\.')));
  }
  assert.match(index, /mastery-domain-v6\.js/);
  assert.match(index, /module-practice-v6\.js/);
  assert.match(index, /course-experience-v6\.js/);
});

test('M02 lessons keep their richer canonical Learning Lab content', () => {
  assert.ok(m02LabSource, 'm02-learning-lab-data-v5.js must exist');
  const course = loadCourse([m02LabSource]);
  for (const id of ['outcome-tree', 'assumption-map']) {
    const lesson = course.modules.flatMap(module => module.lessons).find(item => item.id === id);
    assert.ok(lesson?.learningLab, `${id} missing learningLab`);
    assert.ok(lesson.learningLab.mission.length > 40, `${id} mission too thin`);
    assert.ok(lesson.learningLab.terms.length >= 4, `${id} needs at least four terms`);
    assert.equal(lesson.learningLab.drills.filter(drill => drill.required !== false).length, 2, `${id} needs cold and exit decisions`);
    assert.ok(lesson.learningLab.workbookFields.filter(field => field.required !== false).length >= 6, `${id} needs substantial workbook evidence`);
  }
  assert.match(app, /lesson\.learningLab \? labReady\(lesson\)\.ready/);
});

test('M02 is now evaluated through the full-course mastery and module-practice domains', () => {
  assert.match(masteryV6, /'outcome-tree': Object\.freeze\(\['value'\]\)/);
  assert.match(masteryV6, /'assumption-map': Object\.freeze\(\['uncertainty'\]\)/);
  assert.match(practiceV6, /m02: Object\.freeze/);
  assert.match(practiceV6, /id: 'value-chain'/);
  assert.match(practiceV6, /id: 'assumption-priority'/);
  assert.match(experienceV6, /modulePracticeComplete/);
  assert.doesNotMatch(experienceV6, /challenge\/m02|Итоговый challenge/i);
});

test('M02 and v6 remain local-only and keep M01 treatment identifiers untouched', () => {
  const combined = m02LabSource + masteryV6 + practiceV6 + experienceV6;
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|WebSocket\s*\(/.test(combined), false);
  const simulatorData = read('m01-simulator-data.js');
  assert.match(simulatorData, /m01-mission-partner-launch-v1/);
  assert.match(simulatorData, /version:\s*1/);
});
