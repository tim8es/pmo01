const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

test('base state remains backward compatible while adding isolated lab state', () => {
  assert.equal(app.includes('lab: {}'), true, 'default state must include an empty lab object');
  assert.equal(app.includes('pm01-state-v1'), true, 'existing storage key must remain unchanged');
});

test('M01 lesson renderer exposes a decision-training sequence and workbook', () => {
  assert.equal(app.includes('lesson.learningLab'), true, 'lesson renderer must branch on optional learningLab metadata');
  assert.equal(app.includes('class="learning-lab"'), true, 'learning lab wrapper missing');
  assert.equal(app.includes('data-lab-drill'), true, 'decision drill controls missing');
  assert.equal(app.includes('class="lab-feedback"'), true, 'immediate feedback region missing');
  assert.equal(app.includes('data-lab-field'), true, 'workbook persistence controls missing');
  assert.equal(app.includes('class="lab-transfer"'), true, 'real-project transfer section missing');
});

test('M01 completion uses substantive lab readiness while legacy lessons keep criteria gate', () => {
  assert.equal(app.includes('function labReady'), true, 'lab readiness helper missing');
  assert.equal(app.includes('requiredDrills'), true, 'lab readiness must account for required drills');
  assert.equal(app.includes('requiredFields'), true, 'lab readiness must account for required workbook fields');
  assert.equal(app.includes('data-criterion'), true, 'legacy criteria gate must remain available for M02-M10');
});

test('lab interactions persist drill answers and workbook values in the existing lesson state', () => {
  assert.equal(app.includes('drillAnswers'), true, 'drill answers must be persisted');
  assert.equal(app.includes('workbook'), true, 'workbook values must be persisted');
  assert.equal(app.includes('updateLabCompletionGate'), true, 'lab completion gate must refresh after interaction');
});
