const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const index=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');

test('base state remains backward compatible while adding canonical lab and practice state', () => {
  assert.ok(app.includes('lab: {}')); assert.ok(app.includes('practice: {}')); assert.ok(app.includes('pm01-state-v1'));
});

test('canonical lesson renderer exposes decision feedback workbook and transfer', () => {
  for (const token of ['lesson.learningLab','class="learning-lab"','data-lab-drill','class="lab-feedback"','data-lab-field','class="lab-transfer"']) assert.ok(app.includes(token),token);
});

test('all lessons use substantive lab readiness instead of legacy checkbox criteria', () => {
  assert.ok(app.includes('function labReady')); assert.ok(app.includes('requiredDrills')); assert.ok(app.includes('requiredFields'));
  assert.ok(app.includes('state.completed.includes(lesson.id) && labReady(lesson).ready'));
  assert.equal(app.includes('data-criterion'),false);
  assert.ok(index.includes('course-learning-labs-v7.js')); assert.ok(index.indexOf('course-learning-labs-v7.js') < index.indexOf('app.js'));
});

test('lab interactions persist drill answers and workbook values in existing course state', () => {
  assert.ok(app.includes('drillAnswers')); assert.ok(app.includes('workbook')); assert.ok(app.includes('updateLabCompletionGate'));
});
