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

test('v3 assets are loaded after legacy theme and learning layers', () => {
  const html = read('index.html');
  const simulator = read('simulator.html');
  assert.ok(html.includes('theme-contract-v3.css'));
  assert.ok(html.includes('practice-reference-v3.js'));
  assert.ok(html.includes('course-clarity-v3.js'));
  assert.ok(html.indexOf('theme-contract-v3.css') > html.indexOf('guided-practice-v2.css'));
  assert.ok(html.indexOf('practice-reference-v3.js') > html.indexOf('practice-scenarios-v2.js'));
  assert.ok(html.indexOf('practice-reference-v3.js') < html.indexOf('app.js'));
  assert.ok(html.indexOf('course-clarity-v3.js') > html.indexOf('guided-practice-v2.js'));
  assert.ok(simulator.includes('theme-contract-v3.css'));
  assert.ok(simulator.indexOf('theme-contract-v3.css') > simulator.indexOf('learning-experience-v2.css'));
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

test('every non-M01 lesson has a substantial reference solution for platform practice', () => {
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
});

test('reference solution UI is optional, explicit and adapts to company context', () => {
  const clarity = read('course-clarity-v3.js');
  assert.doesNotThrow(() => new Function(clarity));
  assert.ok(clarity.includes('Эталонный вариант решения'));
  assert.ok(clarity.includes('Сначала попробуй сам'));
  assert.ok(clarity.includes('data-reference-solution'));
  assert.ok(clarity.includes('pm01-company-context-v1'));
  assert.ok(clarity.includes('Малый бизнес'));
  assert.ok(clarity.includes('Средний бизнес'));
  assert.ok(clarity.includes('Крупный бизнес'));
  assert.equal(/\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(/.test(clarity), false);
});

test('final case completion stays separate from M01 lesson completion', () => {
  const experience = read('learning-experience-v2.js');
  const html = read('index.html');
  const simulator = read('simulator.html');
  assert.ok(experience.includes('function simulationComplete()'));
  assert.ok(experience.includes('function moduleProgress('));
  assert.ok(experience.includes('m01Progress.complete && !caseComplete'));
  assert.ok(experience.includes('Доступен после 2/2 уроков'));
  assert.ok(experience.includes('Готов к прохождению'));
  assert.ok(experience.includes('Итоговый кейс M01'));
  assert.equal((html.match(/simulator\.html#\/mission\/m01/g) || []).length, 0, 'final case must not be a global-nav destination');
  assert.ok(simulator.includes('Итоговый кейс M01'));
  assert.equal(simulator.includes('M01 MISSION'), false);
});
