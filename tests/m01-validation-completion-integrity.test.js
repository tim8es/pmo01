const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const courseDataCode = fs.readFileSync(path.join(__dirname, '..', 'course-data.js'), 'utf8');
const validationDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-data.js'), 'utf8');
const labDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-learning-lab-data.js'), 'utf8');
const validationAppCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-app.js'), 'utf8');
const domain = require('../learning-domain.js');

function storageFrom(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

function validationHarness(initialStorage = {}) {
  const main = { innerHTML: '', focus() {} };
  const document = {
    querySelector(selector) { return selector === '#main' ? main : null; },
    querySelectorAll() { return []; },
  };
  const localStorage = storageFrom(initialStorage);
  const window = {
    PM01Learning: domain,
    addEventListener() {},
    confirm() { return true; },
  };
  const context = {
    window, document, localStorage,
    location: { hash: '#/validation/m01' },
    queueMicrotask(callback) { callback(); },
    console, Date,
  };
  vm.createContext(context);
  vm.runInContext(courseDataCode, context, { filename: 'course-data.js' });
  vm.runInContext(validationDataCode, context, { filename: 'm01-validation-data.js' });
  vm.runInContext(labDataCode, context, { filename: 'm01-learning-lab-data.js' });
  return { context, main, localStorage, window };
}

function completeM01CourseState(window) {
  const lessonIds = ['project-system', 'system-diagnostic'];
  const lessons = window.PM01.modules.flatMap((module) => module.lessons || []);
  const lab = {};

  for (const id of lessonIds) {
    const current = lessons.find((lesson) => lesson.id === id);
    lab[id] = { drillAnswers: {}, workbook: {} };
    for (const drill of current.learningLab.drills.filter((item) => item.required !== false)) {
      lab[id].drillAnswers[drill.id] = drill.options[0].id;
    }
    for (const field of current.learningLab.workbookFields.filter((item) => item.required !== false)) {
      lab[id].workbook[field.id] = 'evidence';
    }
  }

  return {
    completed: lessonIds,
    notes: {}, criteria: {}, lastLesson: null, diagnostic: {}, lab,
  };
}

function submittedBaseline() {
  return {
    version: 1,
    baseline: {
      answers: {}, reasoning: 'Исходный диагноз уже зафиксирован до обучения.',
      submittedAt: '2026-09-07T10:00:00.000Z',
      score: { total: 5, max: 15, byDimension: {}, answered: 5 },
    },
  };
}

test('validation post-case stays locked when legacy completed flags lack current Learning Lab evidence', () => {
  const courseState = {
    completed: ['project-system', 'system-diagnostic'],
    notes: {}, criteria: {}, lastLesson: null, diagnostic: {}, lab: {},
  };
  const { context, main, localStorage } = validationHarness({
    'pm01-validation-m01-v1': JSON.stringify(submittedBaseline()),
    'pm01-state-v1': JSON.stringify(courseState),
  });
  vm.runInContext(validationAppCode, context, { filename: 'm01-validation-app.js' });

  assert.match(main.innerHTML, /Уроки: нужно завершить оба/);
  assert.doesNotMatch(main.innerHTML, /data-submit-assessment="postCase"/);
  assert.ok(localStorage);
});

test('completed M01 Learning Labs unlock post-case without rendering or requiring duplicate validation drills', () => {
  const { context, main, localStorage, window } = validationHarness({
    'pm01-validation-m01-v1': JSON.stringify(submittedBaseline()),
  });
  localStorage.setItem('pm01-state-v1', JSON.stringify(completeM01CourseState(window)));
  vm.runInContext(validationAppCode, context, { filename: 'm01-validation-app.js' });

  assert.match(main.innerHTML, /Уроки: изучены ✓/);
  assert.match(main.innerHTML, /data-submit-assessment="postCase"/);
  assert.doesNotMatch(main.innerHTML, /Decision Drill/);
  assert.doesNotMatch(main.innerHTML, /data-drill=/);
});
