const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
}

const index = read('index.html');
const simulator = read('simulator.html');
const labSource = read('course-learning-labs-v6.js');
const masterySource = read('mastery-domain-v6.js');
const practiceSource = read('module-practice-v6.js');
const experienceSource = read('course-experience-v6.js');
const experienceCss = read('course-experience-v6.css');
const themeSource = read('theme-runtime-v6.js');

function loadCourseWithV6() {
  const context = { window: {} };
  for (const file of [
    'course-data.js',
    'content-overrides.js',
    'm01-validation-data.js',
    'm01-learning-lab-data.js',
    'm02-learning-lab-data-v5.js',
    'practice-scenarios-v2.js',
    'practice-reference-v3.js',
    'course-learning-labs-v6.js',
  ]) {
    vm.runInNewContext(read(file), context, { filename: file });
  }
  return context.window.PM01;
}

test('v6 is the single presentation layer in the main course runtime', () => {
  for (const asset of [
    'theme-runtime-v6.js',
    'course-learning-labs-v6.js',
    'mastery-domain-v6.js',
    'module-practice-v6.js',
    'course-experience-v6.js',
    'course-experience-v6.css',
  ]) assert.match(index, new RegExp(asset.replaceAll('.', '\\.')));

  for (const retired of [
    'ux-enhancements.js',
    'ux-enhancements.css',
    'learning-experience-v2.js',
    'guided-practice-v2.js',
    'course-clarity-v3.js',
    'skill-first-ui-v5.js',
    'm02-challenge-v5.js',
    'learning-experience-v2.css',
    'guided-practice-v2.css',
    'skill-first-ui-v5.css',
    'm02-challenge-v5.css',
  ]) assert.doesNotMatch(index, new RegExp(retired.replaceAll('.', '\\.')), `${retired} must be retired from runtime`);

  assert.match(simulator, /theme-runtime-v6\.js/);
  assert.match(simulator, /course-experience-v6\.js/);
  assert.doesNotMatch(simulator, /learning-experience-v2|ux-enhancements/);
  assert.ok(index.indexOf('practice-reference-v3.js') < index.indexOf('course-learning-labs-v6.js'));
  assert.ok(index.indexOf('course-learning-labs-v6.js') < index.indexOf('app.js'));
  assert.ok(index.indexOf('mastery-domain-v6.js') < index.indexOf('course-experience-v6.js'));
});

test('all 20 lessons use one Learning Lab contract after v6 data normalization', () => {
  assert.ok(labSource, 'course-learning-labs-v6.js must exist');
  const course = loadCourseWithV6();
  const lessons = course.modules.flatMap(module => module.lessons);
  assert.equal(lessons.length, 20);
  for (const lesson of lessons) {
    assert.ok(lesson.learningLab, `${lesson.id} must have learningLab`);
    assert.ok(String(lesson.learningLab.skill || '').length >= 8, `${lesson.id} skill too thin`);
    assert.ok(String(lesson.learningLab.mission || '').length >= 30, `${lesson.id} mission too thin`);
    assert.ok((lesson.learningLab.drills || []).length >= 1, `${lesson.id} needs a decision before explanation`);
    assert.ok((lesson.learningLab.workedExample?.steps || []).length >= 3, `${lesson.id} needs a worked example`);
    assert.ok((lesson.learningLab.technique?.steps || []).length >= 3, `${lesson.id} needs a technique`);
    assert.ok((lesson.learningLab.workbookFields || []).filter(field => field.required !== false).length >= 3, `${lesson.id} needs substantive evidence fields`);
    assert.ok(String(lesson.learningLab.transferPrompt || '').length >= 20, `${lesson.id} needs transfer`);
  }
});

test('mastery v6 covers the full curriculum and never awards application from raw completion alone', () => {
  assert.ok(masterySource, 'mastery-domain-v6.js must exist');
  const course = loadCourseWithV6();
  const context = { window: {} };
  vm.runInNewContext(masterySource, context, { filename: 'mastery-domain-v6.js' });
  const api = context.window.PM01MasteryV6;
  assert.ok(api);
  assert.deepEqual(Array.from(api.LEVELS, item => item.label), ['Не встречал', 'Понял', 'Применил', 'Доказал']);
  const lessonIds = course.modules.flatMap(module => module.lessons.map(lesson => lesson.id));
  assert.deepEqual(new Set(Object.keys(api.LESSON_SKILLS)), new Set(lessonIds));
  assert.deepEqual(new Set(Object.keys(api.SKILLS)), new Set(['value', 'work', 'information', 'decisions', 'dependencies', 'uncertainty', 'feedback']));

  const rawOnly = api.derive({ courseState: { completed: lessonIds, lab: {} }, modules: course.modules });
  assert.equal(Math.max(...Object.values(rawOnly.skills).map(skill => skill.level)), 0);
});

test('earned final-practice proof survives a retry without granting unrelated skills', () => {
  const course = loadCourseWithV6();
  const context = { window: {} };
  vm.runInNewContext(masterySource, context, { filename: 'mastery-domain-v6.js' });
  const api = context.window.PM01MasteryV6;
  const derived = api.derive({
    courseState: {},
    modules: course.modules,
    practices: {},
    practiceState: { modules: { m02: { completedAt: null, decisions: {}, proof: { value: true } } } },
  });
  assert.equal(derived.skills.value.level, 3);
  assert.equal(derived.skills.value.label, 'Доказал');
  assert.equal(derived.skills.uncertainty.level, 0);
});

test('every module from M02 to M10 has a deterministic final practice with one strongest option per decision', () => {
  assert.ok(practiceSource, 'module-practice-v6.js must exist');
  const context = { window: {}, localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} }, document: { querySelector() { return null; }, readyState: 'complete' }, location: { hash: '' }, requestAnimationFrame() {} };
  context.window.localStorage = context.localStorage;
  context.window.document = context.document;
  context.window.location = context.location;
  context.window.addEventListener = () => {};
  context.window.scrollTo = () => {};
  context.window.requestAnimationFrame = context.requestAnimationFrame;
  vm.runInNewContext(practiceSource, context, { filename: 'module-practice-v6.js' });
  const api = context.window.PM01ModulePracticeV6;
  assert.ok(api);
  for (let i = 2; i <= 10; i += 1) {
    const id = `m${String(i).padStart(2, '0')}`;
    const practice = api.PRACTICES[id];
    assert.ok(practice, `${id} missing final practice`);
    assert.ok(practice.decisions.length >= 1, `${id} needs at least one decision`);
    for (const decision of practice.decisions) {
      assert.equal(decision.options.length, 4, `${id}/${decision.id} must have four plausible options`);
      assert.equal(decision.options.filter(option => option.strong === true).length, 1, `${id}/${decision.id} must have exactly one strongest option`);
      assert.ok(decision.skills.length >= 1, `${id}/${decision.id} must map to a skill`);
      assert.ok(decision.options.every(option => option.feedback && option.consequence), `${id}/${decision.id} options need feedback and consequence`);
    }
  }
  assert.doesNotMatch(practiceSource, /\bXP\b|streak|leaderboard|монет|коин/i);
});

test('v6 home, path and lesson UX expose one coherent learning loop and evidence-based gamification', () => {
  assert.ok(experienceSource, 'course-experience-v6.js must exist');
  for (const phrase of ['Продолжить обучение', 'Навык сейчас', 'Следующее доказательство', 'Карта компетенций', 'Итоговая практика']) {
    assert.match(experienceSource, new RegExp(phrase));
  }
  assert.match(experienceSource, /course-learning-loop/);
  assert.match(experienceSource, /module-practice-step/);
  assert.match(experienceSource, /capture:\s*true/);
  assert.match(experienceCss, /@media\s*\(max-width:/);
  assert.match(experienceCss, /prefers-reduced-motion/);
});

test('M01 company context locks after the first decision and context surfaces can be rebuilt safely', () => {
  assert.match(experienceSource, /function simulatorContextLocked\(\)/);
  assert.match(experienceSource, /run\?\.decisions/);
  assert.match(experienceSource, /disabled aria-disabled="true"/);
  assert.match(experienceSource, /function invalidateCompanySurfaces\(\)/);
  assert.match(experienceSource, /dataset\.decisionId/);
  assert.match(experienceSource, /Контекст зафиксирован после первого решения/);
});

test('theme runtime is isolated from course navigation and remains persistent', () => {
  assert.match(themeSource, /pm01-theme-v1/);
  assert.match(themeSource, /prefers-color-scheme: light/);
  assert.match(themeSource, /root\.dataset\.theme/);
  assert.doesNotMatch(themeSource, /returning-home|module-learning-meta|courseState|lastLesson/);
});

test('v6 remains local-only and keeps the pinned M01 treatment untouched', () => {
  const combined = labSource + masterySource + practiceSource + experienceSource + themeSource;
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|WebSocket\s*\(/.test(combined), false);
  const simulatorData = read('m01-simulator-data.js');
  assert.match(simulatorData, /m01-mission-partner-launch-v1/);
  assert.match(simulatorData, /version:\s*1/);
});
