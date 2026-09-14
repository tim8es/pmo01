const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

function loadCourse() {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read('course-data.js'), context);
  vm.runInContext(read('practice-scenarios-v2.js'), context);
  return context.window.PM01;
}

const html = read('index.html');
const legacyUi = read('guided-practice-v2.js');
const normalizer = read('course-learning-labs-v6.js');

test('guided practice survives as data and is normalized before the base app without loading legacy UI', () => {
  const courseIndex = html.indexOf('src="course-data.js"');
  const caseIndex = html.indexOf('src="practice-scenarios-v2.js"');
  const normalizeIndex = html.indexOf('src="course-learning-labs-v6.js"');
  const appIndex = html.indexOf('src="app.js"');
  assert.ok(courseIndex >= 0 && caseIndex > courseIndex);
  assert.ok(normalizeIndex > caseIndex && normalizeIndex < appIndex);
  assert.equal(html.includes('src="guided-practice-v2.js"'), false);
  assert.equal(html.includes('href="guided-practice-v2.css"'), false);
});

test('all 18 non-M01 lessons retain one specific guided decision case as source content', () => {
  const data = loadCourse();
  const lessons = data.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id })));
  const legacy = lessons.filter((lesson) => lesson.moduleId !== 'm01');
  assert.equal(legacy.length, 18);
  assert.equal(Object.keys(data.guidedPracticeCases).length, 18);
  for (const lesson of legacy) {
    assert.ok(lesson.guidedPractice, `${lesson.id} is missing guided practice`);
    assert.ok(lesson.guidedPractice.title.length >= 8);
    assert.ok(lesson.guidedPractice.situation.length >= 80, `${lesson.id} scenario is too thin`);
    assert.ok(lesson.guidedPractice.prompt.length >= 20);
    assert.ok(lesson.guidedPractice.debrief.length >= 80, `${lesson.id} debrief is too thin`);
  }
});

test('every guided case uses four plausible options with one strongest option and a near-miss', () => {
  const data = loadCourse();
  for (const [id, guided] of Object.entries(data.guidedPracticeCases)) {
    assert.equal(guided.options.length, 4, `${id} must have four options`);
    assert.equal(guided.options.filter((item) => item.score === 3).length, 1, `${id} needs exactly one strongest option`);
    assert.ok(guided.options.some((item) => item.score === 2), `${id} needs a plausible near-miss`);
    assert.equal(new Set(guided.options.map((item) => item.id)).size, 4, `${id} option ids must be unique`);
    for (const option of guided.options) {
      assert.ok(option.label.length >= 20, `${id}/${option.id} label is too thin`);
      assert.ok(option.feedback.length >= 50, `${id}/${option.id} feedback is too thin`);
      assert.ok(option.score >= 0 && option.score <= 3);
    }
  }
});

test('M01 validated learning labs remain separate from guided-case source data', () => {
  const data = loadCourse();
  const m01 = data.modules.find((module) => module.id === 'm01');
  assert.ok(m01);
  assert.equal(m01.lessons.some((lesson) => lesson.guidedPractice), false);
  assert.equal(Object.hasOwn(data.guidedPracticeCases, 'project-system'), false);
  assert.equal(Object.hasOwn(data.guidedPracticeCases, 'system-diagnostic'), false);
});

test('v6 normalizer consumes guided choices as the canonical cold decision', () => {
  assert.doesNotThrow(() => new Function(normalizer));
  assert.match(normalizer, /lesson\.guidedPractice/);
  assert.match(normalizer, /stage:\s*'cold'/);
  assert.match(normalizer, /feedback:\s*option\.feedback/);
  assert.match(normalizer, /score:\s*Number\(option\.score\)/);
});

test('retired guided UI remains local-only as historical compatibility code', () => {
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(/.test(legacyUi), false);
  assert.equal(legacyUi.includes('pm01-state-v1'), false);
  assert.equal(html.includes('pm01-guided-practice-v2'), false);
});
