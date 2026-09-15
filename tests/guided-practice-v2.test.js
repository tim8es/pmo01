const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function read(name) { return fs.readFileSync(path.join(__dirname, '..', name), 'utf8'); }
function loadCourse() { const context={window:{}}; vm.createContext(context); vm.runInContext(read('course-data.js'),context); vm.runInContext(read('practice-scenarios-v2.js'),context); return context.window.PM01; }

const html=read('index.html');
const legacyUi=read('guided-practice-v2.js');
const normalizer=read('course-learning-labs-v7.js');

test('guided cases remain source data and are normalized before canonical app', () => {
  const courseIndex=html.indexOf('src="course-data.js"');
  const caseIndex=html.indexOf('src="practice-scenarios-v2.js"');
  const normalizeIndex=html.indexOf('src="course-learning-labs-v7.js"');
  const appIndex=html.indexOf('src="app.js"');
  assert.ok(courseIndex>=0 && caseIndex>courseIndex);
  assert.ok(normalizeIndex>caseIndex && normalizeIndex<appIndex);
  assert.equal(html.includes('src="guided-practice-v2.js"'),false);
  assert.equal(html.includes('href="guided-practice-v2.css"'),false);
});

test('all 18 non-M01 lessons retain one specific guided decision case', () => {
  const data=loadCourse(); const lessons=data.modules.flatMap(m=>m.lessons.map(l=>({...l,moduleId:m.id}))).filter(l=>l.moduleId!=='m01');
  assert.equal(lessons.length,18); assert.equal(Object.keys(data.guidedPracticeCases).length,18);
  for (const lesson of lessons) { assert.ok(lesson.guidedPractice); assert.ok(lesson.guidedPractice.situation.length>=80); assert.ok(lesson.guidedPractice.debrief.length>=80); }
});

test('every guided case has one strongest option and a near-miss', () => {
  const data=loadCourse();
  for (const [id,guided] of Object.entries(data.guidedPracticeCases)) {
    assert.equal(guided.options.length,4,`${id} must have four options`);
    assert.equal(guided.options.filter(i=>i.score===3).length,1,`${id} strongest`);
    assert.ok(guided.options.some(i=>i.score===2),`${id} near miss`);
    assert.equal(new Set(guided.options.map(i=>i.id)).size,4);
  }
});

test('M01 validated labs remain separate from guided-case source data', () => {
  const data=loadCourse(); const m01=data.modules.find(m=>m.id==='m01');
  assert.equal(m01.lessons.some(l=>l.guidedPractice),false);
  assert.equal(Object.hasOwn(data.guidedPracticeCases,'project-system'),false);
  assert.equal(Object.hasOwn(data.guidedPracticeCases,'system-diagnostic'),false);
});

test('canonical normalizer turns guided choices into cold decisions', () => {
  assert.doesNotThrow(()=>new Function(normalizer));
  assert.match(normalizer,/lesson\.guidedPractice/); assert.match(normalizer,/stage:\s*'cold'/); assert.match(normalizer,/feedback:\s*option\.feedback/); assert.match(normalizer,/score:\s*Number\(option\.score/);
});

test('retired guided UI remains local-only historical code and never runs', () => {
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(/.test(legacyUi),false);
  assert.equal(html.includes('guided-practice-v2.js'),false);
});
