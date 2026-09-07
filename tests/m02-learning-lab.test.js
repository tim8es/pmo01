const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function read(name) {
  const file = path.join(__dirname, '..', name);
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

const html = read('index.html');
const m02DataSource = read('m02-learning-lab-data.js');

test('M02 learning lab data loads after M01 lab data and before the shared app runtime', () => {
  const m01Index = html.indexOf('src="m01-learning-lab-data.js"');
  const m02Index = html.indexOf('src="m02-learning-lab-data.js"');
  const appIndex = html.indexOf('src="app.js"');

  assert.notEqual(m01Index, -1, 'M01 baseline lab script must remain loaded');
  assert.notEqual(m02Index, -1, 'missing m02-learning-lab-data.js');
  assert.equal(m02Index > m01Index, true, 'M02 lab data must load after M01 baseline data');
  assert.equal(m02Index < appIndex, true, 'M02 lab data must load before shared app.js runtime');
});

test('M02 defines substantive learning labs for exactly its two lesson ids', () => {
  assert.notEqual(m02DataSource, '', 'm02-learning-lab-data.js must exist');

  const context = { window: {} };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(read('course-data.js'), context);
  vm.runInContext(m02DataSource, context);

  const m02 = context.PM01.modules.find((module) => module.id === 'm02');
  assert.ok(m02, 'M02 module missing from course data');
  assert.deepEqual(Array.from(m02.lessons, (lesson) => lesson.id), ['outcome-tree', 'assumption-map']);

  for (const lesson of m02.lessons) {
    const lab = lesson.learningLab;
    assert.ok(lab, `${lesson.id} must expose learningLab`);
    assert.ok(lab.skill?.length > 40, `${lesson.id} needs a concrete skill statement`);
    assert.ok(lab.technique?.name, `${lesson.id} technique missing`);
    assert.ok(Array.isArray(lab.technique?.steps) && lab.technique.steps.length >= 4, `${lesson.id} technique needs actionable steps`);
    assert.ok(Array.isArray(lab.workedExample?.steps) && lab.workedExample.steps.length >= 4, `${lesson.id} worked example is too shallow`);
    assert.ok(Array.isArray(lab.drills) && lab.drills.length >= 2, `${lesson.id} needs cold and exit decision drills`);
    assert.ok(lab.drills.every((drill) => Array.isArray(drill.options) && drill.options.length >= 3), `${lesson.id} drills need meaningful alternatives`);
    assert.ok(Array.isArray(lab.workbookFields) && lab.workbookFields.filter((field) => field.required !== false).length >= 6, `${lesson.id} workbook is too thin`);
    assert.ok(lab.transferPrompt?.length > 60, `${lesson.id} transfer prompt must require real-project application`);
  }
});

test('M02 keeps the shared substantive completion contract instead of reintroducing checkbox self-attestation', () => {
  assert.equal(m02DataSource.includes('workbookFields'), true, 'M02 workbook evidence contract missing');
  assert.equal(m02DataSource.includes('required: true'), true, 'M02 must mark required evidence explicitly');
  assert.equal(m02DataSource.includes('criteria:'), false, 'M02 lab must not create a second checkbox completion model');
});
