const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
}

const index = read('index.html');
const app = read('app.js');
const masterySource = read('mastery-domain-v5.js');
const m02LabSource = read('m02-learning-lab-data-v5.js');
const challengeSource = read('m02-challenge-v5.js');
const skillUiSource = read('skill-first-ui-v5.js');

function loadCourse(extraSource = '') {
  const context = { window: {} };
  vm.runInNewContext(read('course-data.js'), context);
  if (extraSource) vm.runInNewContext(extraSource, context);
  return context.window.PM01;
}

function fakeStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); },
    key(index) { return [...data.keys()][index] || null; },
    get length() { return data.size; },
    _data: data,
  };
}

test('v5 assets load in dependency order without becoming global navigation destinations', () => {
  assert.match(index, /mastery-domain-v5\.js/);
  assert.match(index, /m02-learning-lab-data-v5\.js/);
  assert.match(index, /m02-challenge-v5\.js/);
  assert.match(index, /skill-first-ui-v5\.js/);
  assert.ok(index.indexOf('m02-learning-lab-data-v5.js') < index.indexOf('app.js'));
  assert.ok(index.indexOf('mastery-domain-v5.js') < index.indexOf('skill-first-ui-v5.js'));
  assert.ok(index.indexOf('m02-challenge-v5.js') < index.indexOf('skill-first-ui-v5.js'));

  const mainNav = index.match(/<nav class="main-nav">([\s\S]*?)<\/nav>/)?.[1] || '';
  assert.doesNotMatch(mainNav, /challenge\/m02|Итоговый challenge M02/);
});

test('mastery domain derives levels from evidence rather than page visits or raw completion flags', () => {
  assert.ok(masterySource, 'mastery-domain-v5.js must exist');
  const course = loadCourse();
  const context = { window: {} };
  vm.runInNewContext(masterySource, context);
  const api = context.window.PM01MasteryV5;
  assert.ok(api);
  assert.deepEqual(Array.from(api.LEVELS, item => item.label), ['Не встречал', 'Понял', 'Применил', 'Доказал']);

  const empty = api.derive({ courseState: {}, challengeState: {}, modules: course.modules });
  assert.equal(empty.skills.value.level, 0);
  assert.equal(empty.skills.value.label, 'Не встречал');

  const rawCompletedOnly = api.derive({
    courseState: { completed: ['outcome-tree'], lab: {}, notes: {} },
    challengeState: {},
    modules: course.modules,
  });
  assert.equal(rawCompletedOnly.skills.value.level, 0, 'raw completion must not award application mastery without lab evidence');
});

test('M02 lessons use the canonical Learning Lab contract with mission terms decisions and workbook evidence', () => {
  assert.ok(m02LabSource, 'm02-learning-lab-data-v5.js must exist');
  const course = loadCourse(m02LabSource);
  for (const id of ['outcome-tree', 'assumption-map']) {
    const lesson = course.modules.flatMap(module => module.lessons).find(item => item.id === id);
    assert.ok(lesson?.learningLab, `${id} missing learningLab`);
    assert.ok(lesson.learningLab.mission.length > 40, `${id} mission too thin`);
    assert.ok(lesson.learningLab.terms.length >= 4, `${id} needs at least four terms`);
    assert.equal(lesson.learningLab.drills.filter(drill => drill.required !== false).length, 2, `${id} needs cold and exit decisions`);
    assert.ok(lesson.learningLab.workbookFields.filter(field => field.required !== false).length >= 6, `${id} needs substantial workbook evidence`);
  }

  assert.match(skillUiSource, /learningLab\.mission/);
  assert.match(skillUiSource, /learningLab\.terms/);
  assert.match(app, /lesson\.learningLab \? labReady\(lesson\)\.ready/);
});

test('M02 challenge completion and proof are deterministic and skill-specific', () => {
  assert.ok(challengeSource, 'm02-challenge-v5.js must exist');
  const localStorage = fakeStorage();
  const document = { querySelector() { return null; } };
  const location = { hash: '' };
  const context = {
    window: { localStorage, document, location, addEventListener() {} },
    localStorage,
    document,
    location,
    addEventListener() {},
    setTimeout,
    clearTimeout,
  };
  vm.runInNewContext(challengeSource, context);
  const api = context.window.PM01M02ChallengeV5;
  assert.ok(api);
  assert.equal(api.isComplete(), false);
  api.__test.commit('value-chain', 'strong-value');
  api.__test.commit('assumption-priority', 'weak-assumption');
  assert.equal(api.isComplete(), true);
  assert.deepEqual({ ...api.proof() }, { value: true, uncertainty: false });
  assert.ok(localStorage._data.has('pm01-m02-challenge-v5'));
});

test('skill-first home makes current skill and next evidence prominent', () => {
  assert.ok(skillUiSource, 'skill-first-ui-v5.js must exist');
  assert.match(skillUiSource, /PM01MasteryV5/);
  assert.match(skillUiSource, /PM01M02ChallengeV5/);
  assert.match(skillUiSource, /Навык сейчас/);
  assert.match(skillUiSource, /Следующее доказательство/);
  assert.match(skillUiSource, /Карта навыков/);
  for (const id of ['value', 'work', 'information', 'decisions', 'dependencies', 'uncertainty', 'feedback']) {
    assert.match(skillUiSource, new RegExp(id), `missing skill ${id}`);
  }
  assert.doesNotMatch(skillUiSource, /XP|streak|leaderboard|монет|коин/i);
});

test('v5 remains local-only and does not change M01 treatment identifiers', () => {
  const combined = masterySource + m02LabSource + challengeSource + skillUiSource;
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|WebSocket\s*\(/.test(combined), false);
  const simulatorData = read('m01-simulator-data.js');
  assert.match(simulatorData, /m01-mission-partner-launch-v1/);
  assert.match(simulatorData, /version:\s*1/);
});
