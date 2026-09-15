const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function read(path) { return fs.existsSync(path) ? fs.readFileSync(path,'utf8') : ''; }
const index=read('index.html'); const app=read('app.js'); const m02Lab=read('m02-learning-lab-data-v5.js'); const mastery=read('mastery-domain-v7.js'); const normalizer=read('course-learning-labs-v7.js');

function loadCourse() {
  const context={window:{}};
  for (const file of ['course-data.js','m02-learning-lab-data-v5.js','practice-scenarios-v2.js','practice-reference-v3.js','course-learning-labs-v7.js']) vm.runInNewContext(read(file),context,{filename:file});
  return context.window.PM01;
}

test('M02 v5 content remains an input while v5 presentation runtime is retired', () => {
  assert.ok(index.includes('m02-learning-lab-data-v5.js'));
  assert.equal(index.includes('mastery-domain-v5.js'),false);
  assert.equal(index.includes('m02-challenge-v5.js'),false);
  assert.equal(index.includes('skill-first-ui-v5.js'),false);
  assert.ok(index.indexOf('m02-learning-lab-data-v5.js') < index.indexOf('course-learning-labs-v7.js'));
  assert.ok(index.indexOf('course-learning-labs-v7.js') < index.indexOf('app.js'));
});

test('M02 lessons keep their richer canonical Learning Lab content', () => {
  const course=loadCourse();
  for (const id of ['outcome-tree','assumption-map']) {
    const lesson=course.modules.flatMap(m=>m.lessons).find(l=>l.id===id);
    assert.ok(lesson.learningLab.mission.length>40); assert.ok(lesson.learningLab.terms.length>=4);
    assert.equal(lesson.learningLab.drills.filter(d=>d.required!==false).length,2);
    assert.ok(lesson.learningLab.workbookFields.filter(f=>f.required!==false).length>=6);
  }
  assert.match(normalizer,/lesson\.learningLab/); assert.match(app,/labReady\(lesson\)\.ready/);
});

test('M02 uses full-course mastery and module-practice route', () => {
  assert.match(mastery,/outcome-tree/); assert.match(mastery,/assumption-map/);
  assert.match(app,/PM01MasteryV7/); assert.match(app,/PM01ModulePracticeV7/); assert.match(app,/#\/practice\/\$\{module\.id\}/);
  assert.match(app,/Навык сейчас/); assert.match(app,/Следующее доказательство/); assert.match(app,/Карта компетенций/);
});

test('v7 stays local-only and preserves M01 treatment identifiers', () => {
  const combined=mastery+normalizer+read('module-practice-domain-v7.js')+app;
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|WebSocket\s*\(/.test(combined),false);
  const simulatorData=read('m01-simulator-data.js'); assert.match(simulatorData,/m01-mission-partner-launch-v1/); assert.match(simulatorData,/version:\s*1/);
});
