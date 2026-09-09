const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const courseDataCode = fs.readFileSync(path.join(__dirname, '..', 'course-data.js'), 'utf8');
const validationDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-data.js'), 'utf8');
const labDataCode = fs.readFileSync(path.join(__dirname, '..', 'm01-learning-lab-data.js'), 'utf8');
const gateCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-simulator-gate.js'), 'utf8');
const validationAppCode = fs.readFileSync(path.join(__dirname, '..', 'm01-validation-app.js'), 'utf8');
const domain = require('../learning-domain.js');

function storageFrom(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    _values: values,
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
  vm.runInContext(gateCode, context, { filename: 'm01-validation-simulator-gate.js' });
  return { context, main, localStorage, window };
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

function completedSimulatorEnvelope(overrides = {}) {
  const decisions = [
    { decisionId: 'd1', optionId: 'decision-timeline', rationale: 'Нужно сначала различить механизм.' },
    { decisionId: 'd2', optionId: 'decision-contract', rationale: '' },
    { decisionId: 'd3', optionId: 'split-decision', rationale: '' },
    { decisionId: 'd4', optionId: 'revise-diagnosis', rationale: 'Новый security blocker опровергает прежнюю модель.' },
  ];
  return {
    treatmentId: 'm01-mission-partner-launch-v1',
    missionVersion: 1,
    screen: 'review',
    startedAt: '2026-09-09T10:00:00.000Z',
    completedAt: '2026-09-09T10:08:00.000Z',
    reviewReachedAt: '2026-09-09T10:08:00.000Z',
    run: {
      treatmentId: 'm01-mission-partner-launch-v1',
      missionVersion: 1,
      status: 'decisions_complete',
      decisionIndex: 4,
      decisions,
      meters: { deadline: 72, trust: 85, capacity: 67, risk: 17 },
      flags: { hypothesis_revised: true },
      toolsOpened: [],
      events: [],
    },
    ...overrides,
  };
}

test('legacy M01 lesson completion cannot unlock simulator-treatment post-case', () => {
  const legacyCourseState = {
    completed: ['project-system', 'system-diagnostic'],
    notes: {}, criteria: {}, lastLesson: null, diagnostic: {}, lab: {},
  };
  const { context, main, window } = validationHarness({
    'pm01-validation-m01-v1': JSON.stringify(submittedBaseline()),
    'pm01-state-v1': JSON.stringify(legacyCourseState),
  });
  vm.runInContext(validationAppCode, context, { filename: 'm01-validation-app.js' });

  assert.equal(window.PM01SimulatorGate.isComplete(), false);
  assert.doesNotMatch(main.innerHTML, /data-submit-assessment="postCase"/);
});

test('only exact completed simulator treatment with final review unlocks post-case', () => {
  const { context, main, localStorage, window } = validationHarness({
    'pm01-validation-m01-v1': JSON.stringify(submittedBaseline()),
    'pm01-sim-m01-v1': JSON.stringify(completedSimulatorEnvelope()),
  });
  vm.runInContext(validationAppCode, context, { filename: 'm01-validation-app.js' });

  assert.equal(window.PM01SimulatorGate.isComplete(), true);
  assert.match(main.innerHTML, /data-submit-assessment="postCase"/);
  assert.equal(localStorage._values.has('pm01-state-v1'), false, 'gate must not persist synthetic legacy course evidence');
});

test('simulator treatment does not unlock post-case before final trajectory review is reached', () => {
  const incompleteReview = completedSimulatorEnvelope({ reviewReachedAt: null, completedAt: null, screen: 'consequence' });
  const { context, main, window } = validationHarness({
    'pm01-validation-m01-v1': JSON.stringify(submittedBaseline()),
    'pm01-sim-m01-v1': JSON.stringify(incompleteReview),
  });
  vm.runInContext(validationAppCode, context, { filename: 'm01-validation-app.js' });

  assert.equal(window.PM01SimulatorGate.isComplete(), false);
  assert.doesNotMatch(main.innerHTML, /data-submit-assessment="postCase"/);
});

test('simulator treatment rejects wrong version or broken D1/D4 rationale evidence', () => {
  const wrongVersion = completedSimulatorEnvelope({ missionVersion: 2 });
  const { context: versionContext, main: versionMain, window: versionWindow } = validationHarness({
    'pm01-validation-m01-v1': JSON.stringify(submittedBaseline()),
    'pm01-sim-m01-v1': JSON.stringify(wrongVersion),
  });
  vm.runInContext(validationAppCode, versionContext, { filename: 'm01-validation-app.js' });
  assert.equal(versionWindow.PM01SimulatorGate.isComplete(), false);
  assert.doesNotMatch(versionMain.innerHTML, /data-submit-assessment="postCase"/);

  const missingRationale = completedSimulatorEnvelope();
  missingRationale.run.decisions[3].rationale = '';
  const { context: rationaleContext, main: rationaleMain, window: rationaleWindow } = validationHarness({
    'pm01-validation-m01-v1': JSON.stringify(submittedBaseline()),
    'pm01-sim-m01-v1': JSON.stringify(missingRationale),
  });
  vm.runInContext(validationAppCode, rationaleContext, { filename: 'm01-validation-app.js' });
  assert.equal(rationaleWindow.PM01SimulatorGate.isComplete(), false);
  assert.doesNotMatch(rationaleMain.innerHTML, /data-submit-assessment="postCase"/);
});
