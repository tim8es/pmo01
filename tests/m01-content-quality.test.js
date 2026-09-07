const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const courseDataCode = fs.readFileSync(path.join(__dirname, '..', 'course-data.js'), 'utf8');
const validationDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-data.js'), 'utf8');
const labDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-learning-lab-data.js'), 'utf8');

function loadM01() {
  const context = { window: {}, console };
  vm.createContext(context);
  vm.runInContext(courseDataCode, context, { filename: 'course-data.js' });
  vm.runInContext(validationDataCode, context, { filename: 'm01-validation-data.js' });
  vm.runInContext(labDataCode, context, { filename: 'm01-learning-lab-data.js' });
  const pm01 = context.window.PM01;
  const lessons = pm01.modules.flatMap((module) => module.lessons || []);
  return {
    validation: pm01.m01Validation,
    lessons: ['project-system', 'system-diagnostic'].map((id) => lessons.find((lesson) => lesson.id === id)),
  };
}

test('M01.1 preserves the five validation dimensions', () => {
  const { validation } = loadM01();
  assert.deepEqual(
    Array.from(validation.rubricDimensions, (dimension) => dimension.id),
    ['mechanism', 'evidence', 'tradeoffs', 'intervention', 'changeCondition']
  );
});

test('every required M01 drill uses 3-4 plausible choices with a scored near-miss', () => {
  const { lessons } = loadM01();
  for (const lesson of lessons) {
    for (const drill of lesson.learningLab.drills.filter((item) => item.required !== false)) {
      assert.ok(drill.options.length >= 3 && drill.options.length <= 4, `${drill.id} must have 3-4 options`);
      assert.ok(drill.options.some((option) => Number(option.score) === 3), `${drill.id} must have a strongest option`);
      assert.ok(drill.options.some((option) => Number(option.score) === 2), `${drill.id} must include a credible near-miss`);
    }
  }
});

test('each M01 workbook has six required fields including alternative hypothesis and falsifier', () => {
  const { lessons } = loadM01();
  for (const lesson of lessons) {
    const required = lesson.learningLab.workbookFields.filter((field) => field.required !== false);
    assert.equal(required.length, 6, `${lesson.id} must have exactly six required workbook fields`);
    const ids = new Set(required.map((field) => field.id));
    assert.ok(ids.has('alternative'), `${lesson.id} must require an alternative hypothesis`);
    assert.ok(ids.has('falsifier'), `${lesson.id} must require a falsifying fact`);
  }
});

test('M01 transfer requires a real decision, evidence and a condition for revising it', () => {
  const { lessons } = loadM01();
  for (const lesson of lessons) {
    const prompt = lesson.learningLab.transferPrompt.toLowerCase();
    assert.match(prompt, /решени/, `${lesson.id} transfer must require a real decision`);
    assert.match(prompt, /(evidence|доказ|факт)/, `${lesson.id} transfer must require evidence`);
    assert.match(prompt, /(пересмотр|измен|отмен|опроверг)/, `${lesson.id} transfer must define when to revise the decision`);
  }
});
