const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const dataPath = path.join(__dirname, '..', 'm01-validation-data.js');
const dataExists = fs.existsSync(dataPath);

function loadValidation() {
  const sandbox = { window: { PM01: {} } };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(dataPath, 'utf8'), sandbox, { filename: 'm01-validation-data.js' });
  return sandbox.window.PM01.m01Validation;
}

test('M01 validation content module exists', () => {
  assert.equal(dataExists, true, 'm01-validation-data.js must exist');
});

test('M01 validation covers five stable rubric dimensions', { skip: !dataExists }, () => {
  const validation = loadValidation();
  assert.deepEqual(
    Array.from(validation.rubricDimensions, (item) => item.id),
    ['mechanism', 'evidence', 'tradeoffs', 'intervention', 'changeCondition']
  );
});

test('baseline and post-case are non-identical five-question assessments using the same dimensions', { skip: !dataExists }, () => {
  const validation = loadValidation();
  assert.notEqual(validation.baseline.id, validation.postCase.id);
  assert.notEqual(validation.baseline.scenario, validation.postCase.scenario);

  for (const assessment of [validation.baseline, validation.postCase]) {
    assert.equal(assessment.questions.length, 5);
    assert.deepEqual(
      Array.from(assessment.questions, (question) => question.dimension).sort(),
      ['changeCondition', 'evidence', 'intervention', 'mechanism', 'tradeoffs']
    );
    for (const question of assessment.questions) {
      assert.equal(question.options.length, 4);
      for (const option of question.options) {
        assert.equal(Number.isInteger(option.score), true);
        assert.equal(option.score >= 0 && option.score <= 3, true);
        assert.equal(typeof option.feedback, 'string');
        assert.equal(option.feedback.length > 20, true);
      }
    }
  }
});

test('M01 validation includes two lesson drills plus field application and reflection', { skip: !dataExists }, () => {
  const validation = loadValidation();
  assert.equal(validation.decisionDrills.length >= 2, true);
  assert.deepEqual(
    Array.from(validation.decisionDrills, (drill) => drill.lessonId).sort(),
    ['project-system', 'system-diagnostic']
  );

  const fieldIds = Array.from(validation.fieldApplication.fields, (field) => field.id);
  for (const required of ['project', 'symptom', 'mechanism', 'intervention', 'signal', 'evidence', 'nextDecision']) {
    assert.equal(fieldIds.includes(required), true, `missing field ${required}`);
  }
  assert.equal(validation.reflection.prompts.length >= 3, true);
});
