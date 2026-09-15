const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
}

const index = read('index.html');
const app = read('app.js');
const labsSource = read('course-learning-labs-v7.js');
const masterySource = read('mastery-domain-v7.js');
const practiceSource = read('module-practice-domain-v7.js');
const themeSource = read('theme-runtime-v7.js');

function loadCourse() {
  const context = { window: {} };
  for (const file of [
    'course-data.js',
    'content-overrides.js',
    'm01-validation-data.js',
    'm01-learning-lab-data.js',
    'm02-learning-lab-data-v5.js',
    'practice-scenarios-v2.js',
    'practice-reference-v3.js',
    'course-learning-labs-v7.js',
  ]) {
    vm.runInNewContext(read(file), context, { filename: file });
  }
  return context.window.PM01;
}

test('index loads one canonical course presentation runtime', () => {
  for (const retired of [
    'ux-enhancements.js',
    'learning-experience-v2.js',
    'guided-practice-v2.js',
    'course-clarity-v3.js',
    'skill-first-ui-v5.js',
    'm02-challenge-v5.js',
  ]) assert.doesNotMatch(index, new RegExp(retired.replaceAll('.', '\\.')), `${retired} must not run`);

  for (const required of [
    'theme-runtime-v7.js',
    'course-learning-labs-v7.js',
    'module-practice-domain-v7.js',
    'mastery-domain-v7.js',
    'app.js',
    'canonical-runtime-v7.css',
  ]) assert.match(index, new RegExp(required.replaceAll('.', '\\.')));

  assert.ok(index.indexOf('course-learning-labs-v7.js') < index.indexOf('app.js'));
  assert.ok(index.indexOf('mastery-domain-v7.js') < index.indexOf('app.js'));
  assert.ok(index.indexOf('module-practice-domain-v7.js') < index.indexOf('app.js'));
});

test('all 20 lessons share one Learning Lab contract before app render', () => {
  assert.ok(labsSource);
  const course = loadCourse();
  const lessons = course.modules.flatMap(module => module.lessons);
  assert.equal(lessons.length, 20);
  for (const lesson of lessons) {
    assert.ok(lesson.learningLab, `${lesson.id} missing learningLab`);
    assert.ok(String(lesson.learningLab.mission || '').length >= 30, `${lesson.id} mission too thin`);
    assert.ok((lesson.learningLab.drills || []).length >= 1, `${lesson.id} needs a cold decision`);
    assert.ok((lesson.learningLab.workedExample?.steps || []).length >= 3, `${lesson.id} needs worked example`);
    assert.ok((lesson.learningLab.technique?.steps || []).length >= 3, `${lesson.id} needs technique`);
    assert.ok((lesson.learningLab.workbookFields || []).filter(field => field.required !== false).length >= 3, `${lesson.id} needs evidence fields`);
  }
});

test('canonical app owns module-practice routing and does not use post-render observers', () => {
  assert.match(app, /parts\[0\]\s*===\s*["']practice["']/);
  assert.match(app, /function\s+practiceView/);
  assert.match(app, /function\s+homeView/);
  assert.match(app, /function\s+courseView/);
  assert.doesNotMatch(app, /MutationObserver/);
  assert.doesNotMatch(app, /outerHTML\s*=\s*.*home|replaceWith\s*\(/);
});

test('mastery covers full curriculum and raw completed flags grant no application', () => {
  assert.ok(masterySource);
  const course = loadCourse();
  const context = { window: {} };
  vm.runInNewContext(masterySource, context, { filename: 'mastery-domain-v7.js' });
  const api = context.window.PM01MasteryV7;
  assert.ok(api);
  assert.deepEqual(Array.from(api.LEVELS, item => item.label), ['Не встречал', 'Понял', 'Применил', 'Доказал']);
  const lessonIds = course.modules.flatMap(module => module.lessons.map(lesson => lesson.id));
  assert.deepEqual(new Set(Object.keys(api.LESSON_SKILLS)), new Set(lessonIds));
  const derived = api.derive({ courseState: { completed: lessonIds, lab: {} }, modules: course.modules });
  assert.equal(Math.max(...Object.values(derived.skills).map(skill => skill.level)), 0);
});

test('module practice is derived from existing lesson decisions and proof is monotonic', () => {
  assert.ok(practiceSource);
  const course = loadCourse();
  const context = { window: { PM01: course } };
  vm.runInNewContext(practiceSource, context, { filename: 'module-practice-domain-v7.js' });
  const api = context.window.PM01ModulePracticeV7;
  assert.ok(api);
  for (let i = 2; i <= 10; i += 1) {
    const moduleId = `m${String(i).padStart(2, '0')}`;
    const definition = api.definition(moduleId);
    assert.ok(definition, `${moduleId} definition missing`);
    assert.equal(definition.decisions.length, 2, `${moduleId} should combine its two lesson decisions`);
    for (const decision of definition.decisions) {
      assert.ok(decision.options.length >= 3);
      assert.equal(decision.options.filter(option => option.strong).length, 1);
    }
  }
  const previous = { completedAt: '2026-01-01', proof: { value: true }, decisions: {} };
  const next = api.mergeProof(previous, { value: false, uncertainty: true });
  assert.equal(next.value, true);
  assert.equal(next.uncertainty, true);
});

test('home course sidebar and practice copy use one evidence-based progression model', () => {
  for (const phrase of ['Навык сейчас', 'Следующее доказательство', 'Карта компетенций', 'Итоговая практика', 'Применил', 'Доказал']) {
    assert.match(app, new RegExp(phrase));
  }
  assert.match(app, /PM01MasteryV7/);
  assert.match(app, /PM01ModulePracticeV7/);
  assert.doesNotMatch(app, /\bXP\b|streak|leaderboard|монет|коин/i);
});

test('theme runtime is isolated and M01 treatment stays pinned', () => {
  assert.ok(themeSource);
  assert.match(themeSource, /pm01-theme-v1/);
  assert.doesNotMatch(themeSource, /courseState|lastLesson|homeView|courseView/);
  const simulatorData = read('m01-simulator-data.js');
  assert.match(simulatorData, /m01-mission-partner-launch-v1/);
  assert.match(simulatorData, /version:\s*1/);
});
