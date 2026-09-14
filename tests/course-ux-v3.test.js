const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function read(name) {
  return fs.readFileSync(path.join(__dirname, '..', name), 'utf8');
}

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
}

function luminance(hex) {
  const rgb = hexToRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

function lightToken(css, name) {
  const block = css.match(/html\[data-theme="light"\][^{]*\{([\s\S]*?)\}/)?.[1] || '';
  const match = block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(match, `missing ${name} in light theme contract`);
  return match[1];
}

test('v3 reference data and theme contract remain inputs to unified v6 without their legacy presentation layer', () => {
  const html = read('index.html');
  const simulator = read('simulator.html');
  assert.ok(html.includes('theme-contract-v3.css'));
  assert.ok(html.includes('practice-reference-v3.js'));
  assert.ok(html.includes('course-learning-labs-v6.js'));
  assert.equal(html.includes('course-clarity-v3.js'), false);
  assert.equal(html.includes('guided-practice-v2.js'), false);
  assert.ok(html.indexOf('practice-reference-v3.js') < html.indexOf('course-learning-labs-v6.js'));
  assert.ok(html.indexOf('course-learning-labs-v6.js') < html.indexOf('app.js'));
  assert.ok(simulator.includes('theme-contract-v3.css'));
  assert.ok(simulator.includes('course-experience-v6.css'));
  assert.equal(simulator.includes('learning-experience-v2.css'), false);
});

test('light theme contract uses readable semantic tokens and repairs legacy surfaces', () => {
  const css = read('theme-contract-v3.css');
  const bg = lightToken(css, '--tc-bg');
  const surface = lightToken(css, '--tc-surface');
  const text = lightToken(css, '--tc-text');
  const muted = lightToken(css, '--tc-text-muted');
  assert.ok(contrast(text, bg) >= 7, `primary text contrast too low: ${contrast(text, bg)}`);
  assert.ok(contrast(text, surface) >= 7, `surface text contrast too low: ${contrast(text, surface)}`);
  assert.ok(contrast(muted, bg) >= 4.5, `muted text contrast too low: ${contrast(muted, bg)}`);
  assert.ok(css.includes('--ink-2: var(--tc-surface)'));
  for (const selector of [
    '.mobile-nav a', '.practice', '.criterion', '.learning-lab', '.lab-feedback',
    '.guided-practice-v2', '.gp-option', '.question-card', '.diagnostic-result',
    '.tool-card', '.validation-step', '.validation-scenario', '.sim-shell',
    '.sim-situation', '.sim-decision-card', '.button:disabled', 'textarea'
  ]) assert.ok(css.includes(selector), `light contract does not cover ${selector}`);
});

test('every non-M01 lesson has a substantial reference solution reused by v6 learning labs', () => {
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(read('course-data.js'), context);
  vm.runInContext(read('practice-scenarios-v2.js'), context);
  vm.runInContext(read('practice-reference-v3.js'), context);
  const data = context.window.PM01;
  const lessons = data.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id })));
  const legacy = lessons.filter((lesson) => lesson.moduleId !== 'm01');
  assert.equal(legacy.length, 18);
  assert.equal(Object.keys(data.practiceReferenceSolutions).length, 18);
  for (const lesson of legacy) {
    const reference = lesson.referenceSolution;
    assert.ok(reference, `${lesson.id} missing reference solution`);
    assert.ok(reference.title.length >= 8);
    assert.ok(reference.steps.length >= 3, `${lesson.id} needs at least three reference steps`);
    assert.ok(reference.steps.join(' ').length >= 180, `${lesson.id} reference solution is too thin`);
    assert.ok(reference.check.length >= 50, `${lesson.id} needs a concrete quality check`);
  }
  const normalizer = read('course-learning-labs-v6.js');
  assert.match(normalizer, /lesson\.referenceSolution/);
  assert.match(normalizer, /workedExample/);
});

test('company context and final-case framing are owned by v6 while M01 completion remains separate', () => {
  const experience = read('course-experience-v6.js');
  const html = read('index.html');
  const simulator = read('simulator.html');
  assert.ok(experience.includes('pm01-company-context-v1'));
  assert.ok(experience.includes('Малый бизнес'));
  assert.ok(experience.includes('Средний бизнес'));
  assert.ok(experience.includes('Крупный бизнес'));
  assert.ok(experience.includes('function m01CaseComplete()'));
  assert.ok(experience.includes("module.id === 'm01'"));
  assert.ok(experience.includes('Итоговый кейс M01'));
  assert.equal((html.match(/simulator\.html#\/mission\/m01/g) || []).length, 0, 'final case must not be a global-nav destination');
  assert.ok(simulator.includes('Итоговый кейс M01'));
  assert.equal(simulator.includes('M01 MISSION'), false);
});
